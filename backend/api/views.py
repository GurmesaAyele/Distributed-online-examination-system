from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q, Count, Avg
from .models import *
from .serializers import *
from .permissions import IsAdmin, IsTeacher, IsStudent
from .utils import generate_certificate_pdf
from .pdf_parser import parse_pdf_questions
import random


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        if not user.is_active:
            return Response({'error': 'Account is deactivated'}, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    def create(self, request, *args, **kwargs):
        # Only admins can create users
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can create users'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # Only admins can update other users
        if request.user.role != 'admin' and request.user.id != kwargs.get('pk'):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # Only admins can delete users
        if request.user.role != 'admin':
            return Response({'detail': 'Only admins can delete users'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload_profile_picture(self, request):
        user = request.user
        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']
            user.save()
            serializer = self.get_serializer(user, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Allow users to change their own password"""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Both old and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if old password is correct
        if not user.check_password(old_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password
        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Exam.objects.all()
        elif user.role == 'teacher':
            return Exam.objects.filter(teacher=user)
        else:
            # Students see all approved exams (no assignment or time filtering)
            return Exam.objects.filter(status='approved')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamDetailSerializer
        return ExamSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user, status='pending')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can approve exams'}, status=status.HTTP_403_FORBIDDEN)
        
        exam = self.get_object()
        exam.status = 'approved'
        exam.save()
        return Response({'message': 'Exam approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can reject exams'}, status=status.HTTP_403_FORBIDDEN)
        
        exam = self.get_object()
        exam.status = 'rejected'
        exam.save()
        return Response({'message': 'Exam rejected'})

    @action(detail=True, methods=['get'])
    def students_status(self, request, pk=None):
        exam = self.get_object()
        assignments = ExamAssignment.objects.filter(exam=exam).select_related('student')
        
        students_data = []
        for assignment in assignments:
            attempt = ExamAttempt.objects.filter(assignment=assignment).first()
            students_data.append({
                'student_id': assignment.student.id,
                'student_name': assignment.student.get_full_name(),
                'is_online': attempt and attempt.status == 'in_progress',
                'status': attempt.status if attempt else 'not_started',
                'progress': attempt.answers.count() if attempt else 0,
                'tab_switch_count': attempt.tab_switch_count if attempt else 0,
                'copy_paste_count': attempt.copy_paste_count if attempt else 0,
                'violations': attempt.tab_switch_count + attempt.copy_paste_count if attempt else 0,
            })
        
        return Response(students_data)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def parse_pdf(self, request):
        """Parse questions from uploaded PDF file"""
        if 'pdf_file' not in request.FILES:
            return Response({'error': 'No PDF file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        pdf_file = request.FILES['pdf_file']
        
        # Validate file type
        if not pdf_file.name.endswith('.pdf'):
            return Response({'error': 'File must be a PDF'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Parse questions from PDF
            questions = parse_pdf_questions(pdf_file)
            
            if not questions:
                return Response({
                    'error': 'No questions found in PDF',
                    'message': 'Please ensure your PDF follows the format:\n1. Question?\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAnswer: A'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'questions': questions,
                'count': len(questions),
                'message': f'Successfully extracted {len(questions)} questions from PDF'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to parse PDF',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        questions_data = request.data.get('questions', [])
        exam_id = request.data.get('exam_id')
        
        try:
            exam = Exam.objects.get(id=exam_id, teacher=request.user)
        except Exam.DoesNotExist:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
        
        questions = []
        for idx, q_data in enumerate(questions_data):
            q_data['exam'] = exam.id
            q_data['order'] = idx + 1
            serializer = QuestionSerializer(data=q_data)
            if serializer.is_valid():
                questions.append(serializer.save())
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': f'{len(questions)} questions created'}, status=status.HTTP_201_CREATED)


class ExamAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ExamAssignment.objects.all()
    serializer_class = ExamAssignmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def assign_students(self, request):
        exam_id = request.data.get('exam_id')
        student_ids = request.data.get('student_ids', [])
        
        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
        
        assignments = []
        for student_id in student_ids:
            assignment, created = ExamAssignment.objects.get_or_create(
                exam=exam,
                student_id=student_id
            )
            if created:
                assignments.append(assignment)
        
        return Response({'message': f'{len(assignments)} students assigned'})


class ExamAttemptViewSet(viewsets.ModelViewSet):
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ExamAttempt.objects.all()
        elif user.role == 'teacher':
            return ExamAttempt.objects.filter(exam__teacher=user)
        else:
            # Students see only their own attempts
            return ExamAttempt.objects.filter(student=user)

    @action(detail=False, methods=['post'])
    def start_exam(self, request):
        exam_id = request.data.get('exam_id')
        
        # Get or create assignment (auto-assign student to exam)
        try:
            exam = Exam.objects.get(id=exam_id, status='approved')
        except Exam.DoesNotExist:
            return Response({'error': 'Exam not found or not approved'}, status=status.HTTP_404_NOT_FOUND)
        
        assignment, created = ExamAssignment.objects.get_or_create(
            exam=exam,
            student=request.user
        )
        
        # Check if student was banned (auto-submitted due to violations)
        banned_attempt = ExamAttempt.objects.filter(
            assignment=assignment, 
            status='auto_submitted'
        ).first()
        
        if banned_attempt:
            return Response({
                'error': 'You are banned from this exam due to violations',
                'details': 'This exam was auto-submitted because you exceeded the maximum violations (3). You cannot retake this exam.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if assignment.is_completed:
            return Response({'error': 'Exam already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        existing_attempt = ExamAttempt.objects.filter(assignment=assignment, status='in_progress').first()
        if existing_attempt:
            serializer = self.get_serializer(existing_attempt)
            return Response(serializer.data)
        
        attempt = ExamAttempt.objects.create(
            assignment=assignment,
            student=request.user,
            exam=assignment.exam,
            total_marks=assignment.exam.total_marks,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def save_answer(self, request, pk=None):
        attempt = self.get_object()
        question_id = request.data.get('question_id')
        answer_text = request.data.get('answer_text')
        
        if attempt.student != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if attempt.status != 'in_progress':
            return Response({'error': 'Exam not in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        answer, created = Answer.objects.update_or_create(
            attempt=attempt,
            question_id=question_id,
            defaults={'answer_text': answer_text}
        )
        
        return Response({'message': 'Answer saved'})

    @action(detail=True, methods=['post'])
    def log_violation(self, request, pk=None):
        attempt = self.get_object()
        violation_type = request.data.get('violation_type')
        
        if attempt.student != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        ViolationLog.objects.create(
            attempt=attempt,
            violation_type=violation_type,
            details=request.data.get('details', '')
        )
        
        if violation_type == 'tab_switch':
            attempt.tab_switch_count += 1
        elif violation_type == 'copy_paste':
            attempt.copy_paste_count += 1
        
        attempt.save()
        
        total_violations = attempt.tab_switch_count + attempt.copy_paste_count
        
        if total_violations >= 3:
            attempt.status = 'auto_submitted'
            attempt.end_time = timezone.now()
            attempt.save()
            return Response({'message': 'Exam auto-submitted due to violations', 'auto_submit': True})
        
        return Response({'message': 'Violation logged', 'total_violations': total_violations})

    @action(detail=True, methods=['post'])
    def submit_exam(self, request, pk=None):
        attempt = self.get_object()
        
        if attempt.student != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        attempt.status = 'submitted'
        attempt.end_time = timezone.now()
        attempt.save()
        
        # Auto-grade MCQs
        self._auto_grade_mcqs(attempt)
        
        assignment = attempt.assignment
        assignment.is_completed = True
        assignment.save()
        
        return Response({'message': 'Exam submitted successfully'})

    def _auto_grade_mcqs(self, attempt):
        answers = Answer.objects.filter(attempt=attempt).select_related('question')
        total_marks = 0
        
        for answer in answers:
            question = answer.question
            if question.question_type in ['mcq', 'true_false']:
                if answer.answer_text.strip().lower() == question.correct_answer.strip().lower():
                    answer.is_correct = True
                    answer.marks_obtained = question.marks
                    total_marks += question.marks
                else:
                    answer.is_correct = False
                    if attempt.exam.negative_marking:
                        answer.marks_obtained = -attempt.exam.negative_marks_per_question
                        total_marks -= attempt.exam.negative_marks_per_question
                    else:
                        answer.marks_obtained = 0
                answer.save()
        
        attempt.obtained_marks = total_marks
        attempt.percentage = (total_marks / attempt.total_marks) * 100 if attempt.total_marks > 0 else 0
        
        # Check if all questions are graded
        subjective_count = answers.filter(question__question_type='subjective', marks_obtained__isnull=True).count()
        if subjective_count == 0:
            attempt.status = 'evaluated'
        
        attempt.save()

    @action(detail=True, methods=['get'])
    def download_certificate(self, request, pk=None):
        attempt = self.get_object()
        
        if attempt.student != request.user and request.user.role not in ['admin', 'teacher']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if attempt.status != 'evaluated':
            return Response({'error': 'Exam not yet evaluated'}, status=status.HTTP_400_BAD_REQUEST)
        
        pdf_file = generate_certificate_pdf(attempt)
        return Response({'pdf_url': pdf_file})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Announcement.objects.filter(Q(target_role='') | Q(target_role=user.role))
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        # Only admins can create announcements
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins can create announcements')
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread announcements for current user"""
        user = request.user
        announcements = Announcement.objects.filter(Q(target_role='') | Q(target_role=user.role))
        read_ids = AnnouncementRead.objects.filter(user=user).values_list('announcement_id', flat=True)
        unread_count = announcements.exclude(id__in=read_ids).count()
        return Response({'unread_count': unread_count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark an announcement as read"""
        announcement = self.get_object()
        AnnouncementRead.objects.get_or_create(announcement=announcement, user=request.user)
        return Response({'message': 'Announcement marked as read'})


# System Settings ViewSet
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Allow anyone to read, but only admins can write
def system_settings_view(request):
    if request.method == 'GET':
        try:
            settings = SystemSettings.objects.first()
            if settings:
                return Response({
                    'logo': settings.logo.url if settings.logo else '',
                    'welcome_text': settings.welcome_text
                })
            return Response({
                'logo': '',
                'welcome_text': 'Welcome to Online Exam Platform'
            })
        except Exception as e:
            return Response({
                'logo': '',
                'welcome_text': 'Welcome to Online Exam Platform'
            })
    
    elif request.method == 'POST':
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        settings, created = SystemSettings.objects.get_or_create(id=1)
        settings.welcome_text = request.data.get('welcome_text', settings.welcome_text)
        settings.save()
        
        return Response({
            'logo': settings.logo.url if settings.logo else '',
            'welcome_text': settings.welcome_text
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_system_logo(request):
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    settings, created = SystemSettings.objects.get_or_create(id=1)
    
    if 'logo' in request.FILES:
        settings.logo = request.FILES['logo']
        settings.save()
        return Response({
            'logo': settings.logo.url,
            'message': 'Logo uploaded successfully'
        })
    
    return Response({'error': 'No logo file provided'}, status=status.HTTP_400_BAD_REQUEST)


class ExamFeedbackViewSet(viewsets.ModelViewSet):
    queryset = ExamFeedback.objects.all()
    serializer_class = ExamFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            # Students see only their own feedback
            return ExamFeedback.objects.filter(student=user)
        elif user.role == 'teacher':
            # Teachers see feedback for their exams
            return ExamFeedback.objects.filter(exam__teacher=user)
        elif user.role == 'admin':
            # Admins see all feedback
            return ExamFeedback.objects.all()
        return ExamFeedback.objects.none()

    def perform_create(self, serializer):
        # Only students can create feedback
        if self.request.user.role != 'student':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only students can submit feedback')
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_response(self, request, pk=None):
        """Teacher adds response to feedback"""
        if request.user.role not in ['teacher', 'admin']:
            return Response({'error': 'Only teachers can respond to feedback'}, status=status.HTTP_403_FORBIDDEN)
        
        feedback = self.get_object()
        
        # Check if teacher owns the exam
        if request.user.role == 'teacher' and feedback.exam.teacher != request.user:
            return Response({'error': 'You can only respond to feedback for your exams'}, status=status.HTTP_403_FORBIDDEN)
        
        teacher_response = request.data.get('teacher_response', '')
        feedback.teacher_response = teacher_response
        feedback.is_reviewed = True
        feedback.save()
        
        return Response({'message': 'Response added successfully'})
