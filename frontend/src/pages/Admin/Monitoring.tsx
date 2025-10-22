// src/pages/admin/Monitoring.tsx
import React, { useState, useEffect } from 'react';
import './Monitoring.css';

interface ActiveSession {
  id: number;
  student_name: string;
  exam_title: string;
  start_time: string;
  ip_address: string;
  status: string;
  is_flagged: boolean;
}

const Monitoring: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockSessions: ActiveSession[] = [
      {
        id: 1,
        student_name: 'John Doe',
        exam_title: 'Mathematics Final Exam',
        start_time: '2024-01-15T09:00:00Z',
        ip_address: '192.168.1.100',
        status: 'in_progress',
        is_flagged: false
      },
      {
        id: 2,
        student_name: 'Jane Smith',
        exam_title: 'Physics Midterm',
        start_time: '2024-01-15T09:05:00Z',
        ip_address: '192.168.1.101',
        status: 'in_progress',
        is_flagged: true
      },
    ];
    
    setSessions(mockSessions);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading active sessions...</div>;
  }

  return (
    <div className="monitoring">
      <h1>Real-time Monitoring</h1>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p className="stat-number">{sessions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Flagged Sessions</h3>
          <p className="stat-number warning">{sessions.filter(s => s.is_flagged).length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Exams Today</h3>
          <p className="stat-number">5</p>
        </div>
      </div>

      <div className="sessions-table">
        <h2>Active Exam Sessions</h2>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Start Time</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className={session.is_flagged ? 'flagged' : ''}>
                <td>{session.student_name}</td>
                <td>{session.exam_title}</td>
                <td>{new Date(session.start_time).toLocaleString()}</td>
                <td>{session.ip_address}</td>
                <td>
                  <span className={`status-badge ${session.status}`}>
                    {session.status}
                  </span>
                </td>
                <td>
                  <button className="btn-warning">
                    {session.is_flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button className="btn-primary">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Monitoring;