import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    api.get('/exams/available/').then((r) => setExams(r.data)).catch(()=>{});
    api.get('/results/my/').then((r) => setResults(r.data)).catch(()=>{});
  }, []);

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      <section className="card">
        <h3>Available Exams</h3>
        <ul>
          {exams.map((e) => (
            <li key={e.id}>
              <strong>{e.title}</strong> — duration: {e.duration} min — <Link to={`/exam/${e.id}`}>Start</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Your Results</h3>
        <ul>
          {results.map((r) => (
            <li key={r.id}>
              <strong>{r.exam_title}</strong> — {r.score} / {r.total_marks} — <Link to={`/results/${r.id}`}>View</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
