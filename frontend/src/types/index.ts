// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'examiner' | 'student';
  is_active: boolean;
  date_joined: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  subject: string;
  duration: number; // in minutes
  total_marks: number;
  passing_marks: number;
  start_time: string;
  end_time: string;
  is_published: boolean;
  created_by: number;
  created_at: string;
}

export interface Question {
  id: number;
  exam: number;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay';
  marks: number;
  options?: string[];
  correct_answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudentExamAttempt {
  id: number;
  student: number;
  exam: number;
  start_time: string;
  end_time?: string;
  score?: number;
  status: 'in_progress' | 'completed' | 'submitted';
}