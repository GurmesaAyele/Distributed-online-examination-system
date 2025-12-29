export interface User {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

export interface Exam {
  id: number;
  title: string;
  subject_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  total_questions?: number;
  teacher_name?: string;
  department_name?: string;
  course_name?: string;
  description?: string;
  passing_marks?: number;
  negative_marking?: boolean;
  negative_marks_per_question?: number;
  instructions?: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Attempt {
  id: number;
  exam: number;
  status: 'submitted' | 'evaluated' | 'auto_submitted';
  obtained_marks: number;
  total_marks: number;
  percentage: number;
  tab_switch_count: number;
  copy_paste_count: number;
  end_time: string;
}

export interface Feedback {
  id: number;
  exam_title: string;
  comment: string;
  rating: number;
  is_reviewed: boolean;
  teacher_response?: string;
  created_at: string;
}
