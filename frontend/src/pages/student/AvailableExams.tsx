// src/pages/student/AvailableExams.tsx
import React, { useState, useEffect } from 'react';
import './AvailableExams.css';

interface Exam {
  id: number;
  title: string;
  subject: string;
  duration: number;
  total_marks: number;
  start_time: string;
  end_time: string;
  status: string;
}

const AvailableExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockExams: Exam[] = [
      {
        id: 1,
        title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        duration: 120,
        total_marks: 100,
        start_time: '2024-01-15T09:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        status: 'published'
      },
      {
        id: 2,
        title: 'Physics Midterm',
        subject: 'Physics',
        duration: 90,
        total_marks: 80,
        start_time: '2024-01-16T14:00:00Z',
        end_time: '2024-01-16T15:30:00Z',
        status: 'published'
      },
    ];
    
    setExams(mockExams);
    setLoading(false);
  }, []);

  const handleStartExam = (examId: number) => {
    // Navigate to exam page
    alert(`Starting exam ${examId}`);
  };

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <div className="available-exams">
      <h1>Available Exams</h1>
      
      <div className="exams-grid">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <div className="exam-details">
              <p><strong>Subject:</strong> {exam.subject}</p>
              <p><strong>Duration:</strong> {exam.duration} minutes</p>
              <p><strong>Total Marks:</strong> {exam.total_marks}</p>
              <p><strong>Start Time:</strong> {new Date(exam.start_time).toLocaleString()}</p>
              <p><strong>End Time:</strong> {new Date(exam.end_time).toLocaleString()}</p>
            </div>
            <button 
              onClick={() => handleStartExam(exam.id)}
              className="start-exam-btn"
            >
              Start Exam
            </button>
          </div>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="no-exams">
          <p>No exams available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AvailableExams;