import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResultsPage() {
  const { resultId } = useParams();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!resultId) return;
    api.get(`/results/${resultId}/`).then((r) => setResult(r.data)).catch(()=>{});
  }, [resultId]);

  if (!result) return <div className="center">Loading result...</div>;

  return (
    <div className="container">
      <div className="card" id="print-area">
        <header className="row spaced">
          <div>
            <h2>Result — {result.exam_title}</h2>
            <div className="muted">Student: {result.student_name}</div>
            <div className="muted">Date: {new Date(result.date).toLocaleString()}</div>
          </div>
          <div className="score-box">
            <div className="big">{result.score}</div>
            <div className="muted">out of {result.total_marks}</div>
          </div>
        </header>

        <section>
          <h3>Breakdown</h3>
          <ul>
            {result.breakdown.map((b: any) => (
              <li key={b.question_id}>
                <strong>{b.question_text}</strong>
                <div>Answer: {b.student_answer || '(no answer)'}</div>
                <div>Correct: {b.correct_answer}</div>
                <div>Marks: {b.marks_awarded}/{b.marks}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="row">
        <button className="btn" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>
    </div>
  );
}
