// src/pages/admin/ExamManagement.tsx
import React, { useState, useEffect } from 'react';
import './ExamManagement.css';

interface Exam {
  id: number;
  title: string;
  subject: string;
  duration: number;
  total_marks: number;
  passing_marks: number;
  start_time: string;
  end_time: string;
  status: string;
  created_by: string;
}

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    const mockExams: Exam[] = [
      {
        id: 1,
        title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        duration: 120,
        total_marks: 100,
        passing_marks: 40,
        start_time: '2024-01-15T09:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        status: 'published',
        created_by: 'Admin User'
      },
      {
        id: 2,
        title: 'Physics Midterm',
        subject: 'Physics',
        duration: 90,
        total_marks: 80,
        passing_marks: 32,
        start_time: '2024-01-16T14:00:00Z',
        end_time: '2024-01-16T15:30:00Z',
        status: 'draft',
        created_by: 'Admin User'
      },
    ];
    
    setExams(mockExams);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <div className="exam-management">
      <div className="page-header">
        <h1>Exam Management</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Exam
        </button>
      </div>

      <div className="exams-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Duration</th>
              <th>Total Marks</th>
              <th>Passing Marks</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.subject}</td>
                <td>{exam.duration} mins</td>
                <td>{exam.total_marks}</td>
                <td>{exam.passing_marks}</td>
                <td>{new Date(exam.start_time).toLocaleString()}</td>
                <td>{new Date(exam.end_time).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${exam.status}`}>
                    {exam.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-secondary">Publish</button>
                  <button className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamManagement;