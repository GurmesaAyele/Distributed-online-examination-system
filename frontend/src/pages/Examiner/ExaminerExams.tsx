// src/pages/examiner/ExaminerExams.tsx
import React, { useState, useEffect } from 'react';
import './ExaminerExams.css';

interface Exam {
  id: number;
  title: string;
  subject: string;
  status: string;
  total_students: number;
  completed_students: number;
  start_time: string;
  end_time: string;
}

const ExaminerExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockExams: Exam[] = [
      {
        id: 1,
        title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        status: 'published',
        total_students: 45,
        completed_students: 38,
        start_time: '2024-01-15T09:00:00Z',
        end_time: '2024-01-15T11:00:00Z'
      },
      {
        id: 2,
        title: 'Physics Midterm',
        subject: 'Physics',
        status: 'draft',
        total_students: 30,
        completed_students: 0,
        start_time: '2024-01-16T14:00:00Z',
        end_time: '2024-01-16T15:30:00Z'
      },
    ];
    
    setExams(mockExams);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <div className="examiner-exams">
      <div className="page-header">
        <h1>My Exams</h1>
        <button className="btn-primary">
          + Create Exam
        </button>
      </div>

      <div className="exams-grid">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card">
            <div className="exam-header">
              <h3>{exam.title}</h3>
              <span className={`status-badge ${exam.status}`}>
                {exam.status}
              </span>
            </div>
            
            <div className="exam-details">
              <p><strong>Subject:</strong> {exam.subject}</p>
              <p><strong>Students:</strong> {exam.completed_students}/{exam.total_students} completed</p>
              <p><strong>Time:</strong> {new Date(exam.start_time).toLocaleString()} - {new Date(exam.end_time).toLocaleString()}</p>
            </div>

            <div className="exam-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(exam.completed_students / exam.total_students) * 100}%` }}
                ></div>
              </div>
              <span>{Math.round((exam.completed_students / exam.total_students) * 100)}% completed</span>
            </div>

            <div className="exam-actions">
              <button className="btn-secondary">Edit</button>
              <button className="btn-secondary">Monitor</button>
              <button className="btn-primary">Results</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExaminerExams;