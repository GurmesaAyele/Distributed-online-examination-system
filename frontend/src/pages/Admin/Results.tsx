// src/pages/admin/Results.tsx
import React, { useState, useEffect } from 'react';
import './Results.css';

interface ExamResult {
  id: number;
  exam_title: string;
  student_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  status: string;
  submitted_at: string;
}

const Results: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockResults: ExamResult[] = [
      {
        id: 1,
        exam_title: 'Mathematics Final Exam',
        student_name: 'John Doe',
        score: 85,
        total_marks: 100,
        percentage: 85,
        status: 'passed',
        submitted_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        exam_title: 'Physics Midterm',
        student_name: 'Jane Smith',
        score: 65,
        total_marks: 80,
        percentage: 81.25,
        status: 'passed',
        submitted_at: '2024-01-16T15:20:00Z'
      },
    ];
    
    setResults(mockResults);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading results...</div>;
  }

  return (
    <div className="results-management">
      <h1>Results & Reports</h1>
      
      <div className="reports-actions">
        <button className="btn-primary">Generate Report</button>
        <button className="btn-secondary">Export Results</button>
      </div>

      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Student</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.exam_title}</td>
                <td>{result.student_name}</td>
                <td>{result.score}/{result.total_marks}</td>
                <td>{result.percentage}%</td>
                <td>
                  <span className={`status-badge ${result.status}`}>
                    {result.status}
                  </span>
                </td>
                <td>{new Date(result.submitted_at).toLocaleString()}</td>
                <td>
                  <button className="btn-secondary">View Details</button>
                  <button className="btn-primary">Publish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;