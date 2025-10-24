import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [exam, setExam] = useState<any>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!examId) return;
    api.post(`/exams/${examId}/start/`).then((r) => {
      // expected: { exam: {...}, questions: [...], ends_at: timestamp }
      setExam(r.data.exam);
      setQuestions(r.data.questions);
      setEndTime(new Date(r.data.ends_at).getTime());
      // log start success
    }).catch((e) => {
      console.error(e);
      alert('Could not start exam.');
      navigate(-1);
    });
  }, [examId]);

  // autosave every 20s
  useEffect(() => {
    const iv = setInterval(() => autoSave(), 20000);
    return () => clearInterval(iv);
  }, [answers]);

  async function autoSave() {
    if (!examId) return;
    setSaving(true);
    try {
      await api.post(`/exams/${examId}/autosave/`, { answers });
    } catch (e) {
      console.warn('Autosave failed', e);
    } finally {
      setSaving(false);
    }
  }

  const setAnswer = (questionId: string, value: any) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  };

  const submit = async () => {
    if (!examId) return;
    if (!confirm('Submit exam? Once submitted you may not change answers.')) return;
    try {
      const res = await api.post(`/exams/${examId}/submit/`, { answers });
      // expected: { result_id: ..., score: ...}
      navigate(`/results/${res.data.result_id}`);
    } catch (e: any) {
      alert('Submit failed: ' + (e?.response?.data?.detail || e.message));
    }
  };

  if (!exam) return <div className="center">Loading exam...</div>;

  return (
    <div className="container">
      <div className="row spaced">
        <h2>{exam.title}</h2>
        <div className="col">
          <Timer endTime={endTime} onExpire={() => submit()} />
        </div>
      </div>

      <div className="card">
        <p>{exam.instructions}</p>
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
        ))}

        <div className="row">
          <button className="btn" onClick={autoSave}>{saving ? 'Saving...' : 'Save Now'}</button>
          <button className="btn primary" onClick={submit}>Submit Exam</button>
        </div>
      </div>
    </div>
  );
}
