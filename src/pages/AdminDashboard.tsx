import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function AdminDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/exams/').then((r) => setExams(r.data)).catch(() => {});
    api.get('/admin/stats/').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <section className="card">
        <h3>Exams</h3>
        <div className="row">
          <Link to="/admin/create" className="btn">+ Create Exam</Link>
        </div>
        <ul>
          {exams.map((e) => (
            <li key={e.id}>
              <strong>{e.title}</strong> — {e.num_questions} questions — <Link to={`/exam/${e.id}`}>Open</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Analytics</h3>
        {stats ? (
          <>
            <div className="row spaced">
              <div>Avg score: <strong>{stats.avg_score}</strong></div>
              <div>Pass rate: <strong>{stats.pass_rate}%</strong></div>
            </div>
            <div style={{ maxWidth: 600 }}>
              <Bar data={{
                labels: stats.by_exam.map((s: any) => s.title),
                datasets: [{ label: 'Avg Score', data: stats.by_exam.map((s:any)=>s.avg_score) }]
              }} />
            </div>
          </>
        ) : <div>Loading stats...</div>}
      </section>
    </div>
  );
}
