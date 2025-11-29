

import React, { useEffect, useMemo, useState } from 'react';

// -------------------- Shared Types (Copied for single-file independence) --------------------
type Role = 'student' | 'teacher' | 'admin';
type User = { id: string; name: string; email: string; role: Role; active?: boolean; };
type QuestionType = 'mcq' | 'truefalse' | 'short' | 'essay' | 'fill';
type Question = { id: string; subject: string; topic: string; difficulty: 'easy' | 'medium' | 'hard'; type: QuestionType; text: string; choices?: string[]; image?: string | null; };
type Exam = { id: string; title: string; subject: string; description?: string; date: string; startTime: string; endTime: string; durationMinutes: number; totalMarks: number; passingMark: number; randomize: boolean; published: boolean; examinerId?: string | null; assignedTo?: string[]; };
type Submission = { id: string; studentId: string; examId: string; score: number | null; status: 'completed' | 'in_progress' | 'pending_grading'; answers: { questionId: string; response: string; mark: number | null; }[] };

// -------------------- Helpers (Copied for single-file independence) --------------------
const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9);
const saveToLS = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));
const loadFromLS = <T,>(k: string, fallback: T) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const today = () => new Date().toISOString().slice(0, 10);

// -------------------- Initial Mock Data --------------------
const initUsers = (): User[] => loadFromLS<User[]>('demo_users', [
  { id: 't_main', name: 'Ms. Emily Stone', email: 'teacher@demo.com', role: 'teacher', active: true },
  { id: 'u_student1', name: 'Alice Smith', email: 'alice@demo.com', role: 'student', active: true },
  { id: 'u_student2', name: 'Bob Johnson', email: 'bob@demo.com', role: 'student', active: true },
]);
const initQuestions = (): Question[] => loadFromLS<Question[]>('demo_teacher_questions', [
  { id: uid('q_'), subject: 'Math', topic: 'Algebra', difficulty: 'easy', type: 'mcq', text: '2+2 = ?', choices: ['3', '4', '22'], image: null },
  { id: uid('q_'), subject: 'English', topic: 'Grammar', difficulty: 'medium', type: 'essay', text: 'Analyze the use of metaphor in Hamlet.', image: null },
  { id: uid('q_'), subject: 'Science', topic: 'Biology', difficulty: 'hard', type: 'short', text: 'Explain the function of mitochondria.', image: null },
]);
const initExams = (): Exam[] => loadFromLS<Exam[]>('demo_teacher_exams', [
  { id: 'e_final', title: 'Final Exam - English', subject: 'English', description: 'Comprehensive English final.', date: today(), startTime: '10:00', endTime: '12:00', durationMinutes: 120, totalMarks: 100, passingMark: 60, randomize: true, published: true, examinerId: 't_main', assignedTo: ['u_student1', 'u_student2'], },
]);
const initSubmissions = (): Submission[] => loadFromLS<Submission[]>('demo_teacher_submissions', [
    {
        id: uid('s_'), studentId: 'u_student1', examId: 'e_final', score: 85, status: 'completed',
        answers: [
            { questionId: 'q_math1', response: '4', mark: 5 },
            { questionId: 'q_essay1', response: 'Metaphors are used to compare...', mark: null }, // Needs grading
        ]
    },
    {
        id: uid('s_'), studentId: 'u_student2', examId: 'e_final', score: null, status: 'pending_grading',
        answers: [
            { questionId: 'q_math1', response: '3', mark: 0 },
            { questionId: 'q_essay1', response: 'The tragedy of Hamlet...', mark: null }, // Needs grading
        ]
    }
]);


// -------------------- Sub-Components (Forms) --------------------

function ExamForm({ exam, users, onSave }: { exam: Exam | null; users: User[]; onSave: (e: Omit<Exam, 'id'> | Partial<Exam>) => void }) {
    // Simplified version of the Admin ExamForm focusing on Teacher fields
    const [state, setState] = useState<Omit<Exam, 'id' | 'assignedTo'> & { assignedTo: string[] }>(() => ({
        title: exam?.title || '', subject: exam?.subject || '', description: exam?.description || '', date: exam?.date || today(),
        startTime: exam?.startTime || '09:00', endTime: exam?.endTime || '11:00', durationMinutes: exam?.durationMinutes || 90,
        totalMarks: exam?.totalMarks || 100, passingMark: exam?.passingMark || 50, randomize: exam?.randomize ?? true,
        published: exam?.published ?? false, examinerId: exam?.examinerId || 't_main', assignedTo: exam?.assignedTo || [],
    }));

    const students = users.filter(u => u.role === 'student');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleAssignmentChange = (id: string, isChecked: boolean) => {
        setState(prev => ({
            ...prev,
            assignedTo: isChecked ? [...prev.assignedTo, id] : prev.assignedTo.filter(i => i !== id),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.title || !state.subject) return alert('Title and Subject are required.');
        onSave(state);
    };

    return (
        <form onSubmit={handleSubmit} className="form large-form">
            <h3>{exam ? 'Edit Exam' : 'Create New Exam (FR3.1)'}</h3>
            <div className="form-group-grid">
                <label>Title: <input name="title" value={state.title} onChange={handleChange} required /></label>
                <label>Subject: <input name="subject" value={state.subject} onChange={handleChange} required /></label>
                <label>Date: <input type="date" name="date" value={state.date} onChange={handleChange} required /></label>
                <label>Start Time: <input type="time" name="startTime" value={state.startTime} onChange={handleChange} required /></label>
                <label>End Time: <input type="time" name="endTime" value={state.endTime} onChange={handleChange} required /></label>
                <label>Duration (min): <input type="number" name="durationMinutes" value={state.durationMinutes} onChange={handleChange} required min="10" /></label>
                <label>Total Marks: <input type="number" name="totalMarks" value={state.totalMarks} onChange={handleChange} required min="1" /></label>
                <label>Passing Mark: <input type="number" name="passingMark" value={state.passingMark} onChange={handleChange} required min="1" /></label>
            </div>
            <label>Description: <textarea name="description" value={state.description} onChange={handleChange} rows={2} /></label>

            <div className="form-options">
                <label><input type="checkbox" name="randomize" checked={state.randomize} onChange={handleChange} /> Randomize Questions (FR4.5)</label>
                <label><input type="checkbox" name="published" checked={state.published} onChange={handleChange} /> Publish Exam</label>
            </div>

            <fieldset className="assignment-list">
                <legend>Assign to Students</legend>
                <div className="students-scroll">
                    {students.map(s => (
                        <label key={s.id}>
                            <input type="checkbox" checked={state.assignedTo.includes(s.id)} onChange={e => handleAssignmentChange(s.id, e.target.checked)} />
                            {s.name}
                        </label>
                    ))}
                </div>
            </fieldset>

            <button type="submit">{exam ? 'Update Exam (FR3.2)' : 'Create Exam'}</button>
        </form>
    );
}

function QuestionForm({ initialQuestion, onSave, allSubjects }: { initialQuestion: Question | null; onSave: (q: Omit<Question, 'id'>) => void; allSubjects: string[] }) {
    const [state, setState] = useState<Omit<Question, 'id'>>(() => initialQuestion || {
        subject: allSubjects[0] || 'Math', topic: '', difficulty: 'medium', type: 'mcq', text: '', choices: ['', '', ''], image: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
    };

    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...(state.choices || [])];
        newChoices[index] = value;
        setState(prev => ({ ...prev, choices: newChoices }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(state);
    };

    return (
        <form onSubmit={handleSubmit} className="form large-form">
            <h3>{initialQuestion ? 'Edit Question (FR4.2)' : 'Add New Question (FR4.1)'}</h3>
            <div className="form-group-grid">
                <label>Subject (FR4.4): <input name="subject" value={state.subject} onChange={handleChange} list="subject-list" required /></label>
                <datalist id="subject-list">{allSubjects.map(s => <option key={s} value={s} />)}</datalist>
                <label>Topic (FR4.4): <input name="topic" value={state.topic} onChange={handleChange} required /></label>
                <label>Difficulty (FR4.4):
                    <select name="difficulty" value={state.difficulty} onChange={handleChange}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </label>
                <label>Type (FR4.1):
                    <select name="type" value={state.type} onChange={handleChange}>
                        <option value="mcq">MCQ</option>
                        <option value="truefalse">True/False</option>
                        <option value="short">Short Answer</option>
                        <option value="essay">Essay</option>
                        <option value="fill">Fill in the Blanks</option>
                    </select>
                </label>
            </div>
            <label>Question Text: <textarea name="text" value={state.text} onChange={handleChange} rows={3} required /></label>
            <label>Question Image URL (Optional): <input name="image" value={state.image || ''} onChange={handleChange} /></label>

            {(state.type === 'mcq' || state.type === 'truefalse') && (
                <fieldset>
                    <legend>Choices (e.g., for MCQ/TrueFalse)</legend>
                    {(state.choices || ['A', 'B', 'C']).map((choice, index) => (
                        <input key={index} value={choice} onChange={e => handleChoiceChange(index, e.target.value)} placeholder={`Choice ${index + 1}`} style={{ marginBottom: '5px' }} />
                    ))}
                </fieldset>
            )}

            <button type="submit">{initialQuestion ? 'Update Question' : 'Add Question'}</button>
        </form>
    );
}

function GradingForm({ submission, users, questions, onSave }: { submission: Submission; users: User[]; questions: Question[]; onSave: (s: Submission) => void }) {
    const student = users.find(u => u.id === submission.studentId);
    const [marks, setMarks] = useState(() => submission.answers.map(a => a.mark !== null ? a.mark : 0));

    const descriptiveAnswers = submission.answers.map(a => ({
        ...a,
        question: questions.find(q => q.id === a.questionId)!,
    })).filter(a => a.question.type === 'short' || a.question.type === 'essay' || a.question.type === 'fill');

    const handleMarkChange = (index: number, value: string) => {
        const newMarks = [...marks];
        newMarks[index] = Number(value);
        setMarks(newMarks);
    };

    const calculateTotalScore = () => {
        // Simple mock calculation: sum of marks from the descriptive answers, assuming auto-graded questions are already scored.
        return marks.reduce((sum, mark) => sum + mark, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedAnswers = submission.answers.map(answer => {
            const descriptiveIndex = descriptiveAnswers.findIndex(a => a.questionId === answer.questionId);
            if (descriptiveIndex !== -1) {
                return { ...answer, mark: marks[descriptiveIndex] };
            }
            return answer;
        });

        const newScore = calculateTotalScore();
        onSave({
            ...submission,
            answers: updatedAnswers,
            score: newScore,
            status: 'completed',
        });
    };

    if (!student) return null;

    return (
        <form onSubmit={handleSubmit} className="form large-form grading-form">
            <h3>Manual Grading: {student.name}</h3>
            <p>Score for auto-graded Qs (Mock): **80 / 100**</p>
            <hr/>

            {descriptiveAnswers.map((a, index) => (
                <div key={a.questionId} className="grade-item">
                    <p><strong>Q:</strong> {a.question.text}</p>
                    <p className="student-response"><strong>Student Response:</strong> {a.response}</p>
                    <label>
                        Marks Awarded:
                        <input type="number" value={marks[index] || 0} onChange={e => handleMarkChange(index, e.target.value)} min="0" max="20" /> {/* Mock max marks for this Q */}
                    </label>
                </div>
            ))}
            
            <hr/>
            <h4>Calculated Total Score: {calculateTotalScore() + 80} / 100 (Mock)</h4>
            <button type="submit">Complete Grading</button>
        </form>
    );
}


// -------------------- Main Component --------------------

export default function TeacherDashboard() {
    const [currentUser, setCurrentUser] = useState<User>(initUsers().find(u => u.role === 'teacher') || initUsers()[0]);
    const [users, setUsers] = useState<User[]>(initUsers);
    const [questions, setQuestions] = useState<Question[]>(initQuestions);
    const [exams, setExams] = useState<Exam[]>(initExams);
    const [submissions, setSubmissions] = useState<Submission[]>(initSubmissions);
    
    const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'questions' | 'monitor' | 'grade' | 'analytics' | 'chat'>('overview');
    const [showModal, setShowModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [submissionToGrade, setSubmissionToGrade] = useState<Submission | null>(null);

    // Save state to local storage
    useEffect(() => {
        saveToLS('demo_teacher_questions', questions);
        saveToLS('demo_teacher_exams', exams);
        saveToLS('demo_teacher_submissions', submissions);
    }, [questions, exams, submissions]);

    // Derived Data
    const teacherExams = useMemo(() => exams.filter(e => e.examinerId === currentUser.id || e.examinerId === null), [exams, currentUser.id]);
    const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject))), [questions]);
    const submissionsPending = useMemo(() => submissions.filter(s => s.status === 'pending_grading'), [submissions]);

    // Mock Live Monitor Data
    const [monitorData, setMonitorData] = useState(() => users.filter(u => u.role === 'student').map(s => ({ id: s.id, name: s.name, online: Math.random() > 0.3, progress: Math.floor(Math.random() * 100), timeLeft: Math.floor(Math.random() * 120), attempts: 1 })));
    useEffect(() => {
      const t = setInterval(() => {
        setMonitorData(prev => prev.map(p => ({ ...p, progress: Math.min(100, p.progress + Math.floor(Math.random() * 10)), timeLeft: Math.max(0, p.timeLeft - Math.floor(Math.random() * 6)), online: Math.random() > 0.2 })));
      }, 5000);
      return () => clearInterval(t);
    }, []);

    // Handlers
    function updateExam(id: string, patch: Partial<Exam>) {
        setExams(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    }
    function addExam(payload: Omit<Exam, 'id'>) {
        setExams(prev => [{ ...payload, id: uid('e_'), examinerId: currentUser.id }, ...prev]);
    }
    function deleteExam(id: string) { if (confirm('Delete this exam?')) setExams(prev => prev.filter(e => e.id !== id)); }

    function addQuestion(q: Omit<Question, 'id'>) { setQuestions(prev => [{ ...q, id: uid('q_') }, ...prev]); }
    function updateQuestion(id: string, patch: Partial<Question>) { setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q)); }
    function deleteQuestion(id: string) { if (confirm('Delete this question?')) setQuestions(prev => prev.filter(q => q.id !== id)); }

    function updateSubmission(s: Submission) {
        setSubmissions(prev => prev.map(sub => sub.id === s.id ? s : sub));
        setSubmissionToGrade(null);
        setShowModal(false);
    }

    // -------------------- UI pieces --------------------
    function SmallStat({ label, value, color }: { label: string; value: string | number; color: string }) {
        return (
            <div className="stat" style={{ borderLeftColor: color }}>
                <div className="stat-value" style={{ color: color }}>{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        );
    }
    
    // Simple Analytics Data (Mock)
    const analyticsSummary = useMemo(() => ({
        avgScore: 78 + Math.floor(Math.random() * 5),
        avgDifficulty: 'Medium',
        ungradedCount: submissionsPending.length,
        questionTypes: questions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc; }, {} as Record<QuestionType, number>)
    }), [submissionsPending.length, questions]);

    return (
        <div className="admin-app teacher-app">
            <aside className="sidebar">
                <div className="brand">ExamPrep 👩‍🏫</div>
                <div className="user-info">Welcome, **{currentUser.name}**</div>
                <nav>
                    <button className={activeTab==='overview'? 'active':''} onClick={() => setActiveTab('overview')}>📋 Overview</button>
                    <button className={activeTab==='exams'? 'active':''} onClick={() => setActiveTab('exams')}>📝 Exams & Scheduling</button>
                    <button className={activeTab==='questions'? 'active':''} onClick={() => setActiveTab('questions')}>📚 Question Bank</button>
                    <button className={activeTab==='monitor'? 'active':''} onClick={() => setActiveTab('monitor')}>💻 Monitor Live</button>
                    <button className={activeTab==='grade'? 'active':''} onClick={() => setActiveTab('grade')}>💯 Grade Submissions {submissionsPending.length > 0 && <span className="badge">{submissionsPending.length}</span>}</button>
                    <button className={activeTab==='analytics'? 'active':''} onClick={() => setActiveTab('analytics')}>📈 View Analytics</button>
                    <button className={activeTab==='chat'? 'active':''} onClick={() => setActiveTab('chat')}>💬 Announcements/Chat</button>
                </nav>
            </aside>

            <main className="main">
                <header className="topbar">
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('s', '')} Dashboard</h1>
                    <div className="actions">
                        <button onClick={() => { setSelectedExam(null); setActiveTab('exams'); setShowModal(true); }}>+ New Exam</button>
                        <button onClick={() => { setSelectedQuestion(null); setActiveTab('questions'); setShowModal(true); }}>+ Add Question</button>
                    </div>
                </header>

                <div className="content">
                    {activeTab === 'overview' && (
                        <section className="animate-in">
                            <div className="grid-teacher">
                                <div className="card">
                                    <h3>Quick Stats</h3>
                                    <div className="stats-teacher">
                                        <SmallStat label="My Exams" value={teacherExams.length} color="#4f46e5" />
                                        <SmallStat label="Total Questions" value={questions.length} color="#10b981" />
                                        <SmallStat label="Pending Grading" value={submissionsPending.length} color="#f59e0b" />
                                        <SmallStat label="Avg Score (Mock)" value={`${analyticsSummary.avgScore}%`} color="#0ea5e9" />
                                    </div>
                                </div>
                                
                                <div className="card large-card">
                                    <h3>Exams Scheduled</h3>
                                    <table className="table">
                                        <thead><tr><th>Title</th><th>Date</th><th>Duration</th><th>Published</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {teacherExams.map(ex => (
                                                <tr key={ex.id}>
                                                    <td>{ex.title}</td>
                                                    <td>{ex.date} @ {ex.startTime}</td>
                                                    <td>{ex.durationMinutes}m</td>
                                                    <td className={ex.published ? 'status-active' : 'status-inactive'}>{ex.published ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        <button onClick={() => { setSelectedExam(ex); setShowModal(true); }}>Edit</button>
                                                        <button onClick={() => updateExam(ex.id, { published: !ex.published })}>{ex.published ? 'Unpublish' : 'Publish'}</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'exams' && (
                        <section className="animate-in">
                            <h2>📝 Manage & Schedule Exams</h2>
                            <button onClick={() => { setSelectedExam(null); setShowModal(true); }} style={{marginBottom: '15px'}}>+ Create New Exam</button>
                            <div className="card">
                                <table className="table">
                                    <thead><tr><th>Title</th><th>Subject</th><th>Date</th><th>Total Marks</th><th>Random</th><th>Published</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {teacherExams.map(ex => (
                                            <tr key={ex.id}>
                                                <td>{ex.title}</td>
                                                <td>{ex.subject}</td>
                                                <td>{ex.date}</td>
                                                <td>{ex.totalMarks}</td>
                                                <td>{ex.randomize ? 'Yes' : 'No'}</td>
                                                <td className={ex.published ? 'status-active' : 'status-inactive'}>{ex.published ? 'Yes' : 'No'}</td>
                                                <td>
                                                    <button onClick={() => { setSelectedExam(ex); setShowModal(true); }}>Edit (FR3.2)</button>
                                                    <button onClick={() => updateExam(ex.id, { published: !ex.published })}>{ex.published? 'Unpublish' : 'Publish'}</button>
                                                    <button className="danger" onClick={() => deleteExam(ex.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'questions' && (
                        <section className="animate-in">
                            <h2>📚 Question Bank Management</h2>
                            <button onClick={() => { setSelectedQuestion(null); setShowModal(true); }} style={{marginBottom: '15px'}}>+ Add New Question (FR4.1)</button>
                            <div className="card">
                                <table className="table">
                                    <thead><tr><th>Subject</th><th>Topic</th><th>Type</th><th>Difficulty</th><th>Text Snippet</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {questions.map(q => (
                                            <tr key={q.id}>
                                                <td>{q.subject}</td>
                                                <td>{q.topic}</td>
                                                <td className={`q-type-${q.type}`}>{q.type.toUpperCase()}</td>
                                                <td>{q.difficulty}</td>
                                                <td className="q-text">{q.text.substring(0, 50)}...</td>
                                                <td>
                                                    <button onClick={() => { setSelectedQuestion(q); setShowModal(true); }}>Edit (FR4.2)</button>
                                                    <button className="danger" onClick={() => deleteQuestion(q.id)}>Delete (FR4.3)</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'monitor' && (
                        <section className="animate-in">
                            <h2>💻 Live Exam Monitor</h2>
                            <div className="card">
                                <h3>Active Students & Attempts</h3>
                                <div className="monitor-list">
                                    {monitorData.map(s => (
                                        <div key={s.id} className={`monitor-card ${s.online ? 'online' : 'offline'}`}>
                                            <div className="m-header"><b>{s.name}</b> {s.online ? <span className="dot"/> : <span className="dot off"/>}</div>
                                            <div className="meter"><div className="meter-fill" style={{width: `${s.progress}%`}}></div></div>
                                            <div className="m-meta">Progress: **{s.progress}%** • Time left: **{s.timeLeft}m**</div>
                                            <div className="m-meta">Attempts: **{s.attempts}**</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="hint">Teachers can monitor active students and their progress.</div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'grade' && (
                        <section className="animate-in">
                            <h2>💯 Grade Descriptive Questions Manually</h2>
                            <div className="card">
                                <h3>Pending Submissions ({submissionsPending.length})</h3>
                                <table className="table">
                                    <thead><tr><th>Student Name</th><th>Exam Title</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {submissionsPending.map(s => {
                                            const student = users.find(u => u.id === s.studentId);
                                            const exam = exams.find(e => e.id === s.examId);
                                            if (!student || !exam) return null;
                                            return (
                                                <tr key={s.id}>
                                                    <td>{student.name}</td>
                                                    <td>{exam.title}</td>
                                                    <td className="status-inactive">Pending Grading</td>
                                                    <td>
                                                        <button onClick={() => { setSubmissionToGrade(s); setShowModal(true); }}>Grade Manually</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                    
                    {activeTab === 'analytics' && (
                        <section className="animate-in">
                            <h2>📈 View Analytics & Performance</h2>
                            <div className="grid-teacher">
                                <div className="card">
                                    <h3>Overall Performance</h3>
                                    <div className="analytics-box">
                                        <h4>Average Score: <span className="data-highlight">{analyticsSummary.avgScore}%</span></h4>
                                        <p>Submissions graded: **{submissions.length}**</p>
                                        <p>Average question difficulty: **{analyticsSummary.avgDifficulty}**</p>
                                    </div>
                                    <div className="hint">This section shows average score, pass rates, and identifies weak topics.</div>
                                </div>
                                
                                <div className="card large-card">
                                    <h3>Question Type Distribution</h3>
                                    <div className="chart-distribution">
                                        {Object.entries(analyticsSummary.questionTypes).map(([type, count]) => (
                                            <div key={type} className="distribution-item">
                                                <div className="bar-fill" style={{ height: `${count * 10}%` }}></div>
                                                <small>{type.toUpperCase()} ({count})</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'chat' && (
                        <section className="animate-in">
                            <h2>💬 Announcements to Students</h2>
                            <div className="card">
                                <p>This area provides a mock interface to send announcements or initiate a chat.</p>
                                <button onClick={() => alert('Sending mock announcement to all assigned students...')}>Send New Announcement</button>
                                <div className="notice" style={{marginTop: '15px'}}>Example: "Don't forget the Math exam is at 9 AM tomorrow!"</div>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal animate-modal">
                    <div className={`modal-inner ${activeTab === 'exams' || activeTab === 'questions' || activeTab === 'grade' ? 'large-modal' : ''}`}>
                        <button className="close" onClick={() => setShowModal(false)}>×</button>
                        {activeTab === 'exams' && (
                            <ExamForm exam={selectedExam} users={users} onSave={(e) => { if (selectedExam) updateExam(selectedExam.id, e as any); else addExam(e as any); setShowModal(false); }} />
                        )}
                        {activeTab === 'questions' && (
                             <QuestionForm initialQuestion={selectedQuestion} onSave={(q) => { if (selectedQuestion) updateQuestion(selectedQuestion.id, q); else addQuestion(q); setShowModal(false); }} allSubjects={subjects} />
                        )}
                        {activeTab === 'grade' && submissionToGrade && (
                            <GradingForm submission={submissionToGrade} users={users} questions={questions} onSave={updateSubmission} />
                        )}
                    </div>
                </div>
            )}

            {/* -------------------- CSS Styling -------------------- */}
            <style>{`
                :root { --accent:#f97316; --accent-dark:#ea580c; --muted:#6b7280; --bg:#f8fafc; --bg-dark:#1f2937; --card-bg:#fff; --text-color:#1f2937; --danger:#ef4444; --warning:#f59e0b; }
                * { box-sizing: border-box; font-family: Inter, ui-sans-serif, system-ui; }
                html, body, #root { height: 100%; margin: 0; padding: 0; }
                .teacher-app { display: flex; height: 100vh; color: var(--text-color); }

                /* Sidebar */
                .sidebar { width: 250px; background: var(--bg-dark); color: #fff; padding: 25px; display: flex; flex-direction: column; }
                .brand { font-size: 26px; font-weight: 800; margin-bottom: 10px; color: var(--accent); }
                .user-info { font-size: 14px; color: #d1d5db; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                nav { display: flex; flex-direction: column; gap: 6px; }
                nav button { background: transparent; border: none; color: #d1d5db; padding: 12px 10px; text-align: left; border-radius: 8px; cursor: pointer; transition: all .2s; font-size: 15px; display: flex; align-items: center; justify-content: space-between; }
                nav button:hover { background: rgba(255,255,255,0.08); transform: translateX(3px); color: #fff; }
                nav button.active { background: var(--accent); color: #fff; box-shadow: 0 4px 10px rgba(249,115,22,0.4); font-weight: 600; }
                .badge { background: var(--warning); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 999px; }

                /* Main & Topbar */
                .main { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
                .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 30px; background: var(--card-bg); border-bottom: 1px solid #e5e7eb; }
                .topbar h1 { font-size: 20px; margin: 0; color: var(--text-color); }
                .actions button { margin-left: 10px; padding: 10px 16px; border-radius: 8px; border: none; background: var(--accent); color: #fff; cursor: pointer; box-shadow: 0 4px 10px rgba(249,115,22,0.2); transition: background .2s; }
                .actions button:hover { background: var(--accent-dark); }
                .content { padding: 30px; overflow-y: auto; height: 100%; }
                h2 { margin-top: 0; font-size: 24px; color: var(--text-color); border-bottom: 2px solid #eef2ff; padding-bottom: 10px; margin-bottom: 20px; }

                /* Cards & Stats */
                .grid-teacher { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }
                .card { background: var(--card-bg); border-radius: 12px; padding: 25px; box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
                .card.large-card { min-height: 380px; overflow: auto; }
                .stats-teacher { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
                .stat { background: #f9fafb; padding: 15px; border-radius: 8px; min-width: 150px; border-left: 4px solid; flex: 1; }
                .stat-value { font-weight: 700; font-size: 22px; }
                .stat-label { font-size: 13px; color: var(--muted); margin-top: 5px; }

                /* Tables */
                .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .table th, .table td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 14px; }
                .table th { background: #f8fafc; font-weight: 600; color: var(--text-color); }
                .table button { padding: 6px 10px; margin-right: 6px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 13px; }
                .table button.danger { background: #fee2e2; color: var(--danger); }
                .status-active { color: #10b981; font-weight: 600; }
                .status-inactive { color: var(--warning); }
                .q-text { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .q-type-essay { color: #0ea5e9; }
                .q-type-short { color: #22c55e; }

                /* Forms */
                .form { display: flex; flex-direction: column; gap: 15px; }
                .form.large-form { width: 100%; }
                .form-group-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
                .form input:not([type="checkbox"]), .form select, .form textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
                .form button { padding: 10px 15px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px; }
                fieldset { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
                legend { font-weight: 600; color: var(--accent); padding: 0 5px; }

                /* Monitoring */
                .monitor-list { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 15px; }
                .monitor-card { width: 220px; padding: 15px; border-radius: 10px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                .monitor-card.online { border-left: 4px solid #10b981; }
                .monitor-card.offline { border-left: 4px solid #94a3b8; opacity: 0.9; }
                .m-header { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
                .dot { display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 999px; margin-left: 5px; animation: pulse 1.5s infinite; }
                .dot.off { background: #ef4444; animation: none; }
                .meter { height: 8px; background: #e5e7eb; border-radius: 999px; margin: 10px 0; overflow: hidden; }
                .meter-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #0ea5e9); border-radius: 999px; transition: width 1s; }
                .m-meta { font-size: 12px; color: var(--muted); }

                /* Grading */
                .grading-form { gap: 20px; }
                .grade-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
                .student-response { background: #f8fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b; margin-top: 8px; font-style: italic; }

                /* Analytics Chart */
                .analytics-box { padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
                .data-highlight { font-size: 28px; font-weight: 800; color: var(--accent-dark); }
                .chart-distribution { display: flex; align-items: flex-end; justify-content: space-around; height: 200px; padding: 10px 0; }
                .distribution-item { width: 50px; text-align: center; height: 100%; display: flex; flex-direction: column-reverse; }
                .distribution-item .bar-fill { width: 100%; background: #0ea5e9; border-radius: 5px 5px 0 0; transition: height 1s; margin-bottom: 5px; }
                .distribution-item small { font-size: 11px; color: var(--muted); }

                /* Modal */
                .modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000;}
                .modal-inner{background:var(--card-bg);padding:30px;border-radius:14px;box-shadow:0 15px 40px rgba(0,0,0,0.3);position:relative;width:550px;max-height:90vh;overflow-y:auto;}
                .modal-inner.large-modal { width: 750px; }
                .close{position:absolute;top:10px;right:15px;background:transparent;border:none;font-size:24px;color:var(--muted);cursor:pointer;}
                .animate-in { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

            `}</style>
        </div>
    );
}