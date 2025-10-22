// src/pages/student/ExamHistory.tsx
import React, { useState, useEffect } from 'react';
import './ExamHistory.css';

interface ExamAttempt {
  id: number;
  exam_title: string;
  subject: string;
  score: number;
  total_marks: number;
  status: string;
  submitted_at: string;
}

const ExamHistory: React.FC = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockAttempts: ExamAttempt[] = [
      {
        id: 1,
        exam_title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        score: 85,
        total_marks: 100,
        status: 'completed',
        submitted_at: '2024-01-10T10:30:00Z'
      },
      {
        id: 2,
        exam_title: 'Physics Midterm',
        subject: 'Physics',
        score: 72,
        total_marks: 80,
        status: 'completed',
        submitted_at: '2024-01-08T14:15:00Z'
      },
    ];
    
    setAttempts(mockAttempts);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading exam history...</div>;
  }

  return (
    <div className="exam-history">
      <h1>Exam History</h1>
      
      <div className="attempts-table">
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td>{attempt.exam_title}</td>
                <td>{attempt.subject}</td>
                <td>
                  <span className="score">
                    {attempt.score}/{attempt.total_marks}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${attempt.status}`}>
                    {attempt.status}
                  </span>
                </td>
                <td>{new Date(attempt.submitted_at).toLocaleString()}</td>
                <td>
                  <button className="btn-secondary">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attempts.length === 0 && (
        <div className="no-history">
          <p>No exam history available.</p>
        </div>
      )}
    </div>
  );
};

export default ExamHistory;