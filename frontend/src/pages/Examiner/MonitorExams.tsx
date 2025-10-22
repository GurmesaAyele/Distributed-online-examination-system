// src/pages/examiner/MonitorExams.tsx
import React, { useState, useEffect } from 'react';
import './MonitorExams.css';

interface ExamSession {
  id: number;
  student_name: string;
  exam_title: string;
  start_time: string;
  status: string;
  ip_address: string;
  is_flagged: boolean;
}

const MonitorExams: React.FC = () => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockSessions: ExamSession[] = [
      {
        id: 1,
        student_name: 'John Doe',
        exam_title: 'Mathematics Final Exam',
        start_time: '2024-01-15T09:00:00Z',
        status: 'in_progress',
        ip_address: '192.168.1.100',
        is_flagged: false
      },
      {
        id: 2,
        student_name: 'Jane Smith',
        exam_title: 'Mathematics Final Exam',
        start_time: '2024-01-15T09:05:00Z',
        status: 'in_progress',
        ip_address: '192.168.1.101',
        is_flagged: true
      },
    ];
    
    setSessions(mockSessions);
    setLoading(false);
  }, []);

  const handleFlagStudent = (sessionId: number) => {
    // Handle flagging student
    alert(`Flagging session ${sessionId}`);
  };

  if (loading) {
    return <div>Loading active sessions...</div>;
  }

  return (
    <div className="monitor-exams">
      <h1>Monitor Exams</h1>
      
      <div className="sessions-table">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Start Time</th>
              <th>Status</th>
              <th>IP Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className={session.is_flagged ? 'flagged' : ''}>
                <td>{session.student_name}</td>
                <td>{session.exam_title}</td>
                <td>{new Date(session.start_time).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${session.status}`}>
                    {session.status}
                  </span>
                </td>
                <td>{session.ip_address}</td>
                <td>
                  <button 
                    onClick={() => handleFlagStudent(session.id)}
                    className={session.is_flagged ? 'btn-warning' : 'btn-secondary'}
                  >
                    {session.is_flagged ? 'Flagged' : 'Flag'}
                  </button>
                  <button className="btn-primary">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length === 0 && (
        <div className="no-sessions">
          <p>No active exam sessions.</p>
        </div>
      )}
    </div>
  );
};

export default MonitorExams;