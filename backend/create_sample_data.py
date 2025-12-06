"""
Script to create sample data for testing the exam platform
Run: python manage.py shell < create_sample_data.py
"""

from api.models import User, Department, Course, Subject, Exam, Question, ExamAssignment
from django.utils import timezone
from datetime import timedelta

print("Creating sample data...")

# Create Admin
admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin.set_password('admin123')
    admin.save()
    print("✓ Admin created: admin / admin123")

# Create Teachers
teacher1, created = User.objects.get_or_create(
    username='teacher1',
    defaults={
        'email': 'teacher1@example.com',
        'first_name': 'John',
        'last_name': 'Smith',
        'role': 'teacher'
    }
)
if created:
    teacher1.set_password('teacher123')
    teacher1.save()
    print("✓ Teacher created: teacher1 / teacher123")

teacher2, created = User.objects.get_or_create(
    username='teacher2',
    defaults={
        'email': 'teacher2@example.com',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'role': 'teacher'
    }
)
if created:
    teacher2.set_password('teacher123')
    teacher2.save()
    print("✓ Teacher created: teacher2 / teacher123")

# Create Students
for i in range(1, 6):
    student, created = User.objects.get_or_create(
        username=f'student{i}',
        defaults={
            'email': f'student{i}@example.com',
            'first_name': f'Student',
            'last_name': f'Number{i}',
            'role': 'student'
        }
    )
    if created:
        student.set_password('student123')
        student.save()
        print(f"✓ Student created: student{i} / student123")

# Create Departments
cs_dept, _ = Department.objects.get_or_create(
    code='CS',
    defaults={'name': 'Computer Science'}
)
print("✓ Department created: Computer Science")

math_dept, _ = Department.objects.get_or_create(
    code='MATH',
    defaults={'name': 'Mathematics'}
)
print("✓ Department created: Mathematics")

# Create Courses
btech_cs, _ = Course.objects.get_or_create(
    code='BTECH-CS',
    defaults={
        'name': 'Bachelor of Technology - Computer Science',
        'department': cs_dept
    }
)
print("✓ Course created: B.Tech CS")

msc_math, _ = Course.objects.get_or_create(
    code='MSC-MATH',
    defaults={
        'name': 'Master of Science - Mathematics',
        'department': math_dept
    }
)
print("✓ Course created: M.Sc Math")

# Create Subjects
ds_subject, _ = Subject.objects.get_or_create(
    code='CS101',
    defaults={
        'name': 'Data Structures',
        'course': btech_cs,
        'teacher': teacher1
    }
)
print("✓ Subject created: Data Structures")

algo_subject, _ = Subject.objects.get_or_create(
    code='CS201',
    defaults={
        'name': 'Algorithms',
        'course': btech_cs,
        'teacher': teacher1
    }
)
print("✓ Subject created: Algorithms")

calculus_subject, _ = Subject.objects.get_or_create(
    code='MATH101',
    defaults={
        'name': 'Calculus',
        'course': msc_math,
        'teacher': teacher2
    }
)
print("✓ Subject created: Calculus")

# Create Sample Exam
exam, created = Exam.objects.get_or_create(
    title='Data Structures Mid-Term Exam',
    defaults={
        'description': 'Mid-term examination covering arrays, linked lists, stacks, and queues',
        'subject': ds_subject,
        'teacher': teacher1,
        'duration_minutes': 60,
        'total_marks': 50,
        'passing_marks': 20,
        'negative_marking': True,
        'negative_marks_per_question': 0.25,
        'shuffle_questions': True,
        'shuffle_options': True,
        'status': 'approved',
        'start_time': timezone.now(),
        'end_time': timezone.now() + timedelta(days=7)
    }
)

if created:
    print("✓ Exam created: Data Structures Mid-Term")
    
    # Add sample questions
    questions_data = [
        {
            'question_text': 'What is the time complexity of accessing an element in an array by index?',
            'question_type': 'mcq',
            'marks': 2,
            'option_a': 'O(1)',
            'option_b': 'O(n)',
            'option_c': 'O(log n)',
            'option_d': 'O(n^2)',
            'correct_answer': 'A',
            'order': 1
        },
        {
            'question_text': 'Which data structure uses LIFO (Last In First Out) principle?',
            'question_type': 'mcq',
            'marks': 2,
            'option_a': 'Queue',
            'option_b': 'Stack',
            'option_c': 'Array',
            'option_d': 'Linked List',
            'correct_answer': 'B',
            'order': 2
        },
        {
            'question_text': 'In a singly linked list, can we traverse backwards?',
            'question_type': 'true_false',
            'marks': 1,
            'correct_answer': 'False',
            'order': 3
        },
        {
            'question_text': 'Explain the difference between stack and queue data structures.',
            'question_type': 'subjective',
            'marks': 5,
            'correct_answer': 'Stack follows LIFO, Queue follows FIFO',
            'order': 4
        },
        {
            'question_text': 'What is the space complexity of a recursive function that makes n recursive calls?',
            'question_type': 'mcq',
            'marks': 2,
            'option_a': 'O(1)',
            'option_b': 'O(n)',
            'option_c': 'O(log n)',
            'option_d': 'O(n^2)',
            'correct_answer': 'B',
            'order': 5
        }
    ]
    
    for q_data in questions_data:
        Question.objects.create(exam=exam, **q_data)
    
    print(f"✓ Added {len(questions_data)} questions to exam")
    
    # Assign exam to students
    students = User.objects.filter(role='student')
    for student in students:
        ExamAssignment.objects.get_or_create(
            exam=exam,
            student=student
        )
    print(f"✓ Assigned exam to {students.count()} students")

print("\n✅ Sample data creation completed!")
print("\nYou can now login with:")
print("Admin: admin / admin123")
print("Teacher: teacher1 / teacher123")
print("Student: student1 / student123")
