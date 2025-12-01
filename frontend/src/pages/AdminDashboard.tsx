/*
AdminDashboard.tsx
Single-file React + Vite + TypeScript admin dashboard demo

How to use:
1. Place this file in your Vite + React + TypeScript project under src/components/AdminDashboard.tsx
2. Import and render in App.tsx: import AdminDashboard from './components/AdminDashboard';
3. This file uses only React + TypeScript + plain CSS embedded here. No external libraries required.

Notes:
- Data is persisted to localStorage for demonstration.
- Exports support CSV/JSON for reports; PDF/XLSX generation requires libraries and is noted in comments.
- Animations are done with CSS keyframes and transitions.

This component implements UI + mock logic for the features you requested:
- User management (add, edit, delete, change role, reset password, multiple admins)
- Exam creation, edit, schedule, publish/unpublish, assign examiner, assign to students/classes
- Question bank (various types) with categorization and editing
- Monitoring dashboard with simulated real-time status and anti-cheating stubs (Tab Switching Detection, Force Submit)
- Reports export (CSV/JSON) and simple chart visualization
- Notifications composer
- Settings and security toggles (Policies, Backup/Security Management)

This is a demo UI to integrate with real backend endpoints (replace mock functions).
*/

import React, { useEffect, useMemo, useState } from 'react';

// -------------------- Types --------------------
type Role = 'student' | 'teacher' | 'admin';

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active?: boolean;
};

type QuestionType = 'mcq' | 'truefalse' | 'short' | 'essay' | 'fill';

type Question = {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuestionType;
  text: string;
  choices?: string[]; // mcq, truefalse (optionally)
  image?: string | null;
};

type Exam = {
  id: string;
  title: string;
  subject: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  totalMarks: number;
  passingMark: number;
  randomize: boolean; // Randomization rules
  published: boolean;
  examinerId?: string | null;
  assignedTo?: string[]; // user ids / class Ids
};

// -------------------- Helpers --------------------
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

// -------------------- Initial Mock Data --------------------
const initUsers = (): User[] =>
  loadFromLS<User[]>('demo_users', [
    { id: 'u_admin', name: 'Super Admin', email: 'admin@demo.com', role: 'admin', active: true },
    { id: 'u_admin2', name: 'Security Admin', email: 'sec@demo.com', role: 'admin', active: true },
    { id: 'u_teacher', name: 'Dr. T', email: 'teacher@demo.com', role: 'teacher', active: true },
    { id: 'u_student1', name: 'Alice', email: 'alice@demo.com', role: 'student', active: true },
    { id: 'u_student2', name: 'Bob', email: 'bob@demo.com', role: 'student', active: true },
  ]);

const initQuestions = (): Question[] =>
  loadFromLS<Question[]>('demo_questions', [
    { id: uid('q_'), subject: 'Math', topic: 'Algebra', difficulty: 'easy', type: 'mcq', text: '2+2 = ?', choices: ['3', '4', '22'], image: null },
    { id: uid('q_'), subject: 'Physics', topic: 'Motion', difficulty: 'medium', type: 'short', text: 'State Newton\'s 2nd law.', image: null },
    { id: uid('q_'), subject: 'CS', topic: 'React', difficulty: 'hard', type: 'essay', text: 'Explain the concept of React Hooks.', image: null },
  ]);

const today = () => new Date().toISOString().slice(0, 10);
const initExams = (): Exam[] =>
  loadFromLS<Exam[]>('demo_exams', [
    {
      id: 'e_midterm',
      title: 'Midterm Exam - Math',
      subject: 'Math',
      description: 'Midterm covering algebra and calculus basics',
      date: today(),
      startTime: '09:00',
      endTime: '11:00',
      durationMinutes: 120,
      totalMarks: 100,
      passingMark: 60,
      randomize: true,
      published: true,
      examinerId: 'u_teacher',
      assignedTo: ['u_student1', 'u_student2'],
    },
  ]);

// -------------------- User Form Component --------------------
function UserForm({ user, onSave }: { user: User | null; onSave: (u: Omit<User, 'id'>) => void }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<Role>(user?.role || 'student');
  const [active, setActive] = useState(user?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return alert('Name and Email are required.');
    onSave({ name, email, role, active });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>{user ? 'Edit User' : 'Add New User'}</h3>
      <label>Name: <input value={name} onChange={e => setName(e.target.value)} required /></label>
      <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>
        Role:
        <select value={role} onChange={e => setRole(e.target.value as Role)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher / Examiner</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Active Account</label>
      <button type="submit">{user ? 'Update User' : 'Create User'}</button>
      {user && <button type="button" onClick={() => alert('Password reset link sent to ' + user.email)} className="secondary">Reset Password</button>}
    </form>
  );
}

// -------------------- Exam Form Component --------------------
function ExamForm({ exam, users, onSave }: { exam: Exam | null; users: User[]; onSave: (e: Omit<Exam, 'id'> | Partial<Exam>) => void }) {
  const [state, setState] = useState<Omit<Exam, 'id' | 'assignedTo'> & { assignedTo: string[] }>(() => ({
    title: exam?.title || '',
    subject: exam?.subject || '',
    description: exam?.description || '',
    date: exam?.date || today(),
    startTime: exam?.startTime || '09:00',
    endTime: exam?.endTime || '11:00',
    durationMinutes: exam?.durationMinutes || 90,
    totalMarks: exam?.totalMarks || 100,
    passingMark: exam?.passingMark || 50,
    randomize: exam?.randomize ?? true,
    published: exam?.published ?? false,
    examinerId: exam?.examinerId || null,
    assignedTo: exam?.assignedTo || [],
  }));

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

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
    <form onSubmit={handleSubmit} className="form large">
      <h3>{exam ? 'Edit Exam' : 'Create New Exam'}</h3>
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
      <label>Description: <textarea name="description" value={state.description} onChange={handleChange} rows={3} /></label>
      <label>
        Examiner/Invigilator:
        <select name="examinerId" value={state.examinerId || ''} onChange={handleChange}>
          <option value="">(None)</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <div className="form-options">
        <label><input type="checkbox" name="randomize" checked={state.randomize} onChange={handleChange} /> Randomize Questions</label>
        <label><input type="checkbox" name="published" checked={state.published} onChange={handleChange} /> Publish Exam</label>
      </div>

      <fieldset className="assignment-list">
        <legend>Assign to Students</legend>
        <div className="students-scroll">
          {students.map(s => (
            <label key={s.id}>
              <input type="checkbox" checked={state.assignedTo.includes(s.id)} onChange={e => handleAssignmentChange(s.id, e.target.checked)} />
              {s.name} ({s.email})
            </label>
          ))}
        </div>
        <div className="hint">Only assigned students will see the exam.</div>
      </fieldset>

      <button type="submit">{exam ? 'Update Exam' : 'Create Exam'}</button>
    </form>
  );
}

// -------------------- Notification Form Component --------------------
function NotificationForm({ onSend }: { onSend: (n: { title: string; message: string; targetRole: Role | 'all' }) => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<Role | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return alert('Title and Message are required.');
    onSend({ title, message, targetRole });
    setTitle('');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>Title: <input value={title} onChange={e => setTitle(e.target.value)} required /></label>
      <label>
        Recipient Role:
        <select value={targetRole} onChange={e => setTargetRole(e.target.value as Role | 'all')}>
          <option value="all">All Users</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </label>
      <label>Message: <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required /></label>
      <button type="submit">Send Notification</button>
    </form>
  );
}


// -------------------- Main Component --------------------
export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>(initUsers);
  const [questions, setQuestions] = useState<Question[]>(initQuestions);
  const [exams, setExams] = useState<Exam[]>(initExams);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'exams' | 'questions' | 'monitor' | 'reports' | 'settings' | 'notifications'>('overview');

  // UI states
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => saveToLS('demo_users', users), [users]);
  useEffect(() => saveToLS('demo_questions', questions), [questions]);
  useEffect(() => saveToLS('demo_exams', exams), [exams]);

  // Derived counts
  const counts = useMemo(() => ({
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
    exams: exams.length,
    questions: questions.length,
  }), [users, exams, questions]);

  // -------------------- User management handlers --------------------
  function addUser(payload: Omit<User, 'id'>) {
    const u: User = { ...payload, id: uid('u_') };
    setUsers(prev => [u, ...prev]);
  }

  function updateUser(id: string, patch: Partial<User>) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }

  function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function resetPassword(id: string) {
    // FR1.4: Admin must be able to reset user passwords.
    alert(`Password reset link sent to ${users.find(u => u.id === id)?.email || 'user'}. (Mock action)`);
  }

  // -------------------- Exam handlers --------------------
  function createExam(payload: Omit<Exam, 'id'>) {
    const e: Exam = { ...payload, id: uid('e_') };
    setExams(prev => [e, ...prev]);
  }

  function updateExam(id: string, patch: Partial<Exam>) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }

  function deleteExam(id: string) {
    if (!confirm('Delete this exam?')) return;
    setExams(prev => prev.filter(e => e.id !== id));
  }

  // -------------------- Question bank handlers --------------------
  function addQuestion(q: Omit<Question, 'id'>) {
    const n = { ...q, id: uid('q_') };
    setQuestions(prev => [n, ...prev]);
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function deleteQuestion(id: string) {
    if (!confirm('Delete this question?')) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  // -------------------- Reports export --------------------
  function exportCSV(data: object[], filename = 'report.csv') {
    if (!data || !data.length) { alert('No data to export'); return; }
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify((row as any)[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }

  function exportJSON(data: object[], filename = 'report.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }

  // -------------------- Monitoring simulation --------------------
  const [monitorData, setMonitorData] = useState(() => users.filter(u => u.role === 'student').map(s => ({ id: s.id, name: s.name, online: Math.random() > 0.3, progress: Math.floor(Math.random() * 100), timeLeft: Math.floor(Math.random() * 120), cheatingAlert: Math.random() < 0.1 })));

  useEffect(() => {
    // Simulate live updates for anti-cheating/progress monitoring every 4s
    const t = setInterval(() => {
      setMonitorData(prev => prev.map(p => ({
        ...p,
        progress: Math.min(100, p.progress + Math.floor(Math.random() * 10)),
        timeLeft: Math.max(0, p.timeLeft - Math.floor(Math.random() * 6)),
        online: Math.random() > 0.2,
        cheatingAlert: Math.random() < 0.05, // Simulate tab switching/suspicious activity detection
      })));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // -------------------- Simple Analytics --------------------
  const performanceSummary = useMemo(() => {
    // Mock distribution/analytics
    return {
      avgScore: 72 + Math.floor(Math.random() * 10),
      passRate: 0.78,
      byDifficulty: { easy: 0.45, medium: 0.35, hard: 0.2 },
    };
  }, [exams, questions]); // Recalculate if exams/questions change

  // -------------------- Notifications --------------------
  function sendNotification({ title, message, targetRole }: { title: string; message: string; targetRole: Role | 'all' }) {
    // Mock: show an alert and pretend we pushed message
    alert(`Notification sent to ${targetRole}: ${title}\n\n${message}`);
  }

  // -------------------- UI pieces --------------------
  function SmallStat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
      <div className="stat">
        <div className="stat-icon">{icon}</div>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    );
  }

  // -------------------- Render --------------------
  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="brand">ExamMaster 🎓</div>
        <nav>
          <button className={activeTab==='overview'? 'active':''} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button className={activeTab==='users'? 'active':''} onClick={() => setActiveTab('users')}>👥 Users</button>
          <button className={activeTab==='exams'? 'active':''} onClick={() => setActiveTab('exams')}>📝 Exams</button>
          <button className={activeTab==='questions'? 'active':''} onClick={() => setActiveTab('questions')}>📚 Question Bank</button>
          <button className={activeTab==='monitor'? 'active':''} onClick={() => setActiveTab('monitor')}>💻 Monitor Live</button>
          <button className={activeTab==='reports'? 'active':''} onClick={() => setActiveTab('reports')}>📈 Reports</button>
          <button className={activeTab==='notifications'? 'active':''} onClick={() => setActiveTab('notifications')}>🔔 Notifications</button>
          <button className={activeTab==='settings'? 'active':''} onClick={() => setActiveTab('settings')}>⚙️ Settings & Security</button>
        </nav>
        <div className="sidebar-footer">Logged in as <b>Super Admin</b></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users, exams, questions..." />
          </div>
          <div className="actions">
            <button onClick={() => { setSelectedUser(null); setActiveTab('users'); setShowModal(true); }}>+ Add User</button>
            <button onClick={() => { setSelectedExam(null); setActiveTab('exams'); setShowModal(true); }}>+ New Exam</button>
          </div>
        </header>

        <div className="content">
          {activeTab === 'overview' && (
            <section className="animate-in">
              <h2>Dashboard Overview</h2>
              <div className="grid">
                <div className="card stat-summary">
                  <h3>System Status</h3>
                  <div className="stats">
                    <SmallStat label="Students" value={counts.students} icon="👨‍🎓" />
                    <SmallStat label="Teachers" value={counts.teachers} icon="👩‍🏫" />
                    <SmallStat label="Admins" value={counts.admins} icon="👑" />
                    <SmallStat label="Active Exams" value={exams.filter(e => e.published).length} icon="🚀" />
                    <SmallStat label="Total Questions" value={counts.questions} icon="❓" />
                  </div>
                  <div className="analytics">
                    <h4>Overall Performance Snapshot</h4>
                    <div className="mini-chart">
                      <div className="bar" style={{width: `${performanceSummary.avgScore}%`}} title={`Avg ${performanceSummary.avgScore}%`}></div>
                    </div>
                    <div className="meta">Avg Score: **{performanceSummary.avgScore}%** — Pass Rate: **{(performanceSummary.passRate*100).toFixed(0)}%**</div>
                  </div>
                </div>

                <div className="card large">
                  <h3>Upcoming & Active Exams</h3>
                  <table className="table">
                    <thead><tr><th>Title</th><th>Subject</th><th>Date</th><th>Duration</th><th>Published</th><th>Actions</th></tr></thead>
                    <tbody>
                      {exams.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(ex => (
                        <tr key={ex.id}>
                          <td>{ex.title}</td>
                          <td>{ex.subject}</td>
                          <td>{ex.date}</td>
                          <td>{ex.durationMinutes}m</td>
                          <td className={ex.published ? 'status-active' : 'status-inactive'}>{ex.published ? 'Published' : 'Draft'}</td>
                          <td>
                            <button onClick={() => { setSelectedExam(ex); setShowModal(true); }}>Edit</button>
                            <button onClick={() => updateExam(ex.id, { published: !ex.published })}>{ex.published? 'Unpublish':'Publish'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="animate-in">
              <h2>👥 User Management</h2>
              <div className="card">
                <div className="toolbar">
                  <div>**{users.length}** Total Users</div>
                  <div>
                    <button onClick={() => { setSelectedUser(null); setShowModal(true); }}>+ Add User (FR2.1)</button>
                    <button onClick={() => exportCSV(users, 'users.csv')}>Export CSV</button>
                  </div>
                </div>
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role (FR2.4)</th><th>Active</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())).map(u => (
                      <tr key={u.id} className="animate-row">
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td className={`role-${u.role}`}>{u.role}</td>
                        <td>{u.active ? 'Yes':'No'}</td>
                        <td>
                          <button onClick={() => { setSelectedUser(u); setShowModal(true); }}>Edit (FR2.2)</button>
                          <button className="warn" onClick={() => resetPassword(u.id)}>Reset PW (FR1.4)</button>
                          <button className="danger" onClick={() => deleteUser(u.id)}>Delete (FR2.3)</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'exams' && (
            <section className="animate-in">
              <h2>📝 Exam Management</h2>
              <div className="card">
                <div className="toolbar">
                  <div>**{exams.length}** Total Exams</div>
                  <div>
                    <button onClick={() => { setSelectedExam(null); setShowModal(true); }}>+ Create Exam (FR3.1)</button>
                    <button onClick={() => exportCSV(exams as unknown as object[], 'exams.csv')}>Export CSV</button>
                  </div>
                </div>
                <table className="table">
                  <thead><tr><th>Title</th><th>Date/Time</th><th>Duration</th><th>Random</th><th>Published (FR3.4)</th><th>Actions</th></tr></thead>
                  <tbody>
                    {exams.filter(e => e.title.toLowerCase().includes(query.toLowerCase()) || e.subject.toLowerCase().includes(query.toLowerCase())).map(ex => (
                      <tr key={ex.id} className="animate-row">
                        <td>{ex.title}</td>
                        <td>{ex.date} @ {ex.startTime}</td>
                        <td>{ex.durationMinutes}m / {ex.totalMarks} Marks</td>
                        <td>{ex.randomize ? 'Yes' : 'No'}</td>
                        <td className={ex.published ? 'status-active' : 'status-inactive'}>{ex.published ? 'Yes' : 'No'}</td>
                        <td>
                          <button onClick={() => { setSelectedExam(ex); setShowModal(true); }}>Edit (FR3.2)</button>
                          <button onClick={() => updateExam(ex.id, { published: !ex.published })}>{ex.published? 'Unpublish' : 'Publish'}</button>
                          <button className="danger" onClick={() => deleteExam(ex.id)}>Delete (FR3.3)</button>
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
              <div className="card">
                <div className="toolbar">
                  <div>**{questions.length}** Total Questions</div>
                  <div>
                    <button onClick={() => {
                      const sample: Omit<Question, 'id'> = { subject: 'New', topic: 'General', difficulty: 'easy', type: 'mcq', text: 'New Question Text...', choices: ['A','B','C'], image: null };
                      addQuestion(sample); // Simulate FR4.1
                    }}>+ Add Sample Q</button>
                    <button onClick={() => exportCSV(questions as unknown as object[], 'questions.csv')}>Export CSV</button>
                  </div>
                </div>
                <table className="table">
                  <thead><tr><th>Subject (FR4.4)</th><th>Topic</th><th>Type</th><th>Difficulty</th><th>Text</th><th>Actions</th></tr></thead>
                  <tbody>
                    {questions.filter(q => q.text.toLowerCase().includes(query.toLowerCase()) || q.subject.toLowerCase().includes(query.toLowerCase())).map(q => (
                      <tr key={q.id} className="animate-row">
                        <td>{q.subject}</td>
                        <td>{q.topic}</td>
                        <td className={`q-type-${q.type}`}>{q.type.toUpperCase()}</td>
                        <td>{q.difficulty}</td>
                        <td className="q-text">{q.text.substring(0, 40)}...</td>
                        <td>
                          <button onClick={() => { const newText = prompt('Edit question text (FR4.2)', q.text); if (newText) updateQuestion(q.id, { text: newText }); }}>Edit</button>
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
              <h2>💻 Live Exam Monitoring (FR6.1)</h2>
              <div className="card">
                <div className="monitor-list">
                  {monitorData.map(s => (
                    <div key={s.id} className={`monitor-card ${s.online ? 'online' : 'offline'} ${s.cheatingAlert ? 'alert' : ''}`}>
                      <div className="m-header">
                        <b>{s.name}</b> {s.online ? <span className="dot"/> : <span className="dot off"/>}
                        {s.cheatingAlert && <span className="m-alert">⚠️ Anti-Cheating Alert (FR6.2)</span>}
                      </div>
                      <div className="meter"><div className="meter-fill" style={{width: `${s.progress}%`}}></div></div>
                      <div className="m-meta">Progress: **{s.progress}%** • Time left: **{s.timeLeft}m**</div>
                      <div className="m-actions">
                        <button onClick={() => alert('Force submit for ' + s.name)}>Force Submit</button>
                        <button onClick={() => alert('Flagged ' + s.name)} className="danger">Flag Suspicious</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hint">Data simulates real-time monitoring of progress and anti-cheating detections (tab switching, etc.).</div>
              </div>
            </section>
          )}

          {activeTab === 'reports' && (
            <section className="animate-in">
              <h2>📈 Results & Reports (Manage Results and Analytics)</h2>
              <div className="card">
                <div className="reports-grid">
                  <div className="chart-card">
                    <h4>Score Distribution</h4>
                    <div className="bars">
                      <div className="bar-item"><div className="bar-fill" style={{height: '60%'}}></div><small>0-50</small></div>
                      <div className="bar-item"><div className="bar-fill" style={{height: '80%'}}></div><small>51-70</small></div>
                      <div className="bar-item"><div className="bar-fill" style={{height: '50%'}}></div><small>71-85</small></div>
                      <div className="bar-item"><div className="bar-fill" style={{height: '30%'}}></div><small>86-100</small></div>
                    </div>
                  </div>

                  <div className="report-actions">
                    <h4>Export Reports (PDF/Excel/CSV)</h4>
                    <button onClick={() => exportCSV(users as unknown as object[], 'users.csv')}>Export User List (CSV)</button>
                    <button onClick={() => exportCSV(exams as unknown as object[], 'exam_summary.csv')}>Exam Performance (CSV)</button>
                    <button onClick={() => exportJSON([{ summary: performanceSummary }], 'analytics.json')}>Analytics Data (JSON)</button>
                    <div className="hint">PDF / Excel export requires external libraries (not included).</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="animate-in">
              <h2>🔔 Communication & Notifications</h2>
              <div className="card">
                <h3>Send Notification</h3>
                <NotificationForm onSend={sendNotification} />
                <div className="notice">Use to send exam reminders, result announcements, or general system updates.</div>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="animate-in">
              <h2>⚙️ System Management & Security (FR1.4, FR2.4, Policies, Backup)</h2>
              <div className="card">
                <h3>System Settings & Security</h3>
                <div className="settings-grid">
                  <label className="animated-checkbox"><input type="checkbox" defaultChecked /> Enable camera monitoring (Security Rule)</label>
                  <label className="animated-checkbox"><input type="checkbox" defaultChecked /> **Enforce Policies**: IP change detection</label>
                  <label className="animated-checkbox"><input type="checkbox" defaultChecked /> **Backup & Security**: Auto database backups</label>
                  <label className="animated-checkbox"><input type="checkbox" defaultChecked /> **Enforce Policies**: Password complexity</label>
                  <label className="animated-checkbox"><input type="checkbox" defaultChecked /> Enable Auto-Save Answers (Student-Side Rule)</label>
                </div>
                <div className="security-note">Role & Permissions logic is managed via User Forms (FR2.4). Configure JWT expiry, and other complex rules in the backend.</div>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Modal for Add/Edit User or Exam */}
      {showModal && (
        <div className="modal animate-modal">
          <div className={`modal-inner ${activeTab === 'exams' ? 'large-modal' : ''}`}>
            <button className="close" onClick={() => setShowModal(false)}>×</button>
            {activeTab === 'users' && (
              <UserForm user={selectedUser} onSave={(u) => { if (selectedUser) updateUser(selectedUser.id, u); else addUser(u as any); setShowModal(false); }} />
            )}
            {activeTab === 'exams' && (
              <ExamForm exam={selectedExam} users={users} onSave={(e) => { if (selectedExam) updateExam(selectedExam.id, e as any); else createExam(e as any); setShowModal(false); }} />
            )}
          </div>
        </div>
      )}

      {/* -------------------- CSS Styling (Modern, Attractive, Animated) -------------------- */}
      <style>{`
        /* Colors & Fonts */
        :root{ --accent:#4f46e5; --accent-light:#6366f1; --accent-dark:#4338ca; --muted:#6b7280; --bg:#f8fafc; --bg-dark:#0f172a; --card-bg:#fff; --text-color:#1e293b; --danger:#ef4444; }
        * { box-sizing: border-box; font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        html, body, #root { height: 100%; margin: 0; padding: 0; background: var(--bg); }
        .admin-app { display: flex; height: 100vh; color: var(--text-color); }

        /* Sidebar - Dark & Modern */
        .sidebar { width: 220px; background: var(--bg-dark); color: #fff; padding: 20px; display: flex; flex-direction: column; box-shadow: 4px 0 15px rgba(0,0,0,0.1); }
        .brand { font-size: 24px; font-weight: 800; margin-bottom: 25px; color: var(--accent-light); text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        nav button { background: transparent; border: none; color: #cbd5e1; padding: 12px 10px; text-align: left; border-radius: 10px; cursor: pointer; transition: all .25s ease-out; font-size: 15px; display: flex; align-items: center; gap: 10px; }
        nav button:hover { background: rgba(255,255,255,0.08); transform: translateX(4px); color: #fff; }
        nav button.active { background: var(--accent); color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,0.4); font-weight: 600; }
        .sidebar-footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: #94a3b8; }

        /* Main Content & Topbar */
        .main { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 30px; background: var(--card-bg); border-bottom: 1px solid #eef2ff; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
        .search input { padding: 10px 16px; border-radius: 10px; border: 1px solid #e6edf3; min-width: 400px; transition: all .3s; }
        .search input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); outline: none; }
        .actions button { margin-left: 10px; padding: 10px 16px; border-radius: 10px; border: none; background: var(--accent); color: #fff; cursor: pointer; box-shadow: 0 4px 10px rgba(79,70,229,0.2); transition: all .2s; font-weight: 500; }
        .actions button:hover { background: var(--accent-dark); transform: translateY(-1px); }

        /* Content & Cards */
        .content { padding: 30px; overflow-y: auto; height: 100%; }
        h2 { margin-top: 0; font-size: 24px; color: var(--text-color); border-bottom: 2px solid #eef2ff; padding-bottom: 10px; margin-bottom: 20px; }
        h3 { margin-top: 0; color: var(--accent); font-size: 18px; margin-bottom: 15px; }
        .grid { display: grid; grid-template-columns: 320px 1fr; gap: 30px; }
        .card { background: var(--card-bg); border-radius: 14px; padding: 25px; box-shadow: 0 10px 30px rgba(2,6,23,0.08); transition: all .3s; }
        .card:hover { box-shadow: 0 15px 40px rgba(2,6,23,0.1); }
        .card.large { height: 480px; overflow: auto; }
        .stat-summary { display: flex; flex-direction: column; }
        .stats { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; }
        .stat { background: linear-gradient(135deg, #f0f4ff, #e0e8ff); padding: 15px; border-radius: 12px; min-width: 140px; display: flex; align-items: center; gap: 10px; flex: 1; min-width: 130px; box-shadow: inset 0 -2px 0 rgba(79,70,229,0.2); animation: fadeInUp 0.5s; }
        .stat-icon { font-size: 24px; }
        .stat-value { font-weight: 700; font-size: 20px; color: var(--accent-dark); }
        .stat-label { font-size: 13px; color: var(--muted); }
        .analytics { margin-top: 25px; padding-top: 15px; border-top: 1px solid #eef2ff; }
        .mini-chart { margin-top: 12px; background: #eef2ff; border-radius: 999px; height: 15px; overflow: hidden; }
        .mini-chart .bar { height: 100%; background: linear-gradient(90deg, var(--accent), #22c55e); border-radius: 999px; transition: width 1s ease-out; animation: slideIn 1s; }
        .meta { font-size: 14px; color: var(--muted); margin-top: 10px; }
        .meta b { color: var(--text-color); }
        .hint { font-size: 12px; color: var(--muted); padding: 10px 0; border-top: 1px dashed #eef2ff; margin-top: 10px; }
        .notice { font-style: italic; color: #06b6d4; background: #e0f7fa; padding: 10px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #06b6d4; }


        /* Tables */
        .table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 15px; }
        .table th, .table td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 14px; }
        .table th { background: #f8fafc; font-weight: 600; color: var(--text-color); position: sticky; top: 0; z-index: 1; }
        .table tr:last-child td { border-bottom: none; }
        .table button { padding: 6px 10px; margin-right: 6px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .2s; font-size: 13px; }
        .table button:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .table button.danger { background: #fee2e2; color: var(--danger); border-color: #fca5a5; }
        .table button.danger:hover { background: #fecaca; }
        .table button.warn { background: #fff7ed; color: #f97316; border-color: #fed7aa; }
        .status-active { color: #10b981; font-weight: 600; }
        .status-inactive { color: var(--danger); }
        .q-text { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .role-admin { color: var(--accent); font-weight: 600; }
        .role-teacher { color: #06b6d4; font-weight: 500; }
        .role-student { color: #22c55e; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid #eef2ff; margin-bottom: 10px; }

        /* Forms */
        .form { display: flex; flex-direction: column; gap: 15px; }
        .form label { font-weight: 500; font-size: 14px; display: flex; flex-direction: column; gap: 6px; }
        .form input:not([type="checkbox"]), .form select, .form textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border-color .3s; width: 100%; }
        .form input:focus, .form select:focus, .form textarea:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
        .form-group-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .form button { padding: 10px 15px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: background .3s; margin-top: 10px; }
        .form button.secondary { background: #e2e8f0; color: var(--text-color); margin-left: 10px; }
        .form button.secondary:hover { background: #cbd5e1; }
        .form button:hover { background: var(--accent-dark); }
        .form-options { display: flex; gap: 20px; align-items: center; }
        fieldset { border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-top: 15px; }
        legend { font-weight: 600; color: var(--accent); padding: 0 10px; }
        .assignment-list .students-scroll { max-height: 120px; overflow-y: auto; padding: 5px; display: flex; flex-direction: column; gap: 5px; }
        .assignment-list label { font-weight: normal; display: flex; flex-direction: row; align-items: center; gap: 8px; font-size: 13px; }

        /* Monitoring */
        .monitor-list{display:flex;gap:20px;flex-wrap:wrap;margin-top:12px;}
        .monitor-card{width:280px;padding:20px;border-radius:12px;background:#f8fafc;box-shadow:0 8px 24px rgba(2,6,23,0.04);position:relative;transition:transform .2s ease-out, box-shadow .2s; border: 1px solid #eef2ff;}
        .monitor-card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(2,6,23,0.08);}
        .monitor-card.online{border-left:4px solid #10b981;}
        .monitor-card.offline{opacity:0.8;border-left:4px solid #94a3b8;}
        .monitor-card.alert{border:2px solid var(--danger); box-shadow:0 0 15px rgba(239,68,68,0.3);}
        .m-header{display:flex;align-items:center;justify-content:space-between; margin-bottom: 8px;}
        .dot{display:inline-block;width:10px;height:10px;background:#10b981;border-radius:999px;margin-left:8px; animation: pulse 1.5s infinite;}
        .dot.off{background:#ef4444; animation: none;}
        .meter{height:10px;background:#eef2ff;border-radius:999px;margin:10px 0; overflow: hidden;}
        .meter-fill{height:100%;background:linear-gradient(90deg,var(--accent),#06b6d4);border-radius:999px;transition:width 1s; animation: slideIn 1s;}
        .m-meta{font-size:13px;color:#6b7280;}
        .m-alert { font-size: 12px; color: var(--danger); font-weight: 600; animation: flash 1s infinite alternate; }
        .m-actions button{padding:6px 10px;margin-top:10px;margin-right:8px;border-radius:8px;border:none;background:#e2e8f0; color: var(--text-color); cursor: pointer;}
        .m-actions button.danger { background: #fee2e2; color: var(--danger); }

        /* Reports */
        .reports-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-top: 20px; }
        .chart-card { background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #eef2ff; }
        .bars { display: flex; align-items: flex-end; justify-content: space-around; height: 150px; padding: 10px; }
        .bar-item { width: 40px; text-align: center; height: 100%; display: flex; flex-direction: column-reverse; }
        .bar-fill { width: 100%; background: var(--accent-light); border-radius: 5px 5px 0 0; transition: height 1s; animation: growUp 1s; }
        .bar-item small { margin-top: 5px; font-size: 11px; color: var(--muted); }
        .report-actions button { display: block; width: 100%; margin: 10px 0; background: #eef2ff; color: var(--text-color); border: 1px solid #e2e8f0; }
        .report-actions button:hover { background: #e2e8f0; }

        /* Settings */
        .settings-grid { display: flex; flex-direction: column; gap: 15px; margin-top: 15px; }
        .settings-grid label { display: flex; align-items: center; gap: 10px; font-size: 15px; cursor: pointer; }
        .security-note { font-style: italic; color: var(--danger); border-left: 3px solid var(--danger); padding-left: 10px; margin-top: 20px; }
        .animated-checkbox input[type="checkbox"] { transform: scale(1.2); }
        .animated-checkbox:hover input[type="checkbox"] { box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }

        /* Modal */
        .modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000;}
        .modal-inner{background:var(--card-bg);padding:30px;border-radius:14px;box-shadow:0 15px 40px rgba(0,0,0,0.3);position:relative;width:480px;max-height:90vh;overflow-y:auto;}
        .modal-inner.large-modal { width: 700px; }
        .close{position:absolute;top:10px;right:10px;background:transparent;border:none;font-size:24px;color:var(--muted);cursor:pointer;transition:transform .2s;}
        .close:hover{color:var(--danger);transform:rotate(90deg);}

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeInUp 0.5s ease-out; }
        .animate-row { animation: fadeInUp 0.3s ease-out; }
        @keyframes slideIn {
          from { width: 0; }
        }
        @keyframes growUp {
          from { height: 0; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes flash {
          from { background-color: #fef2f2; }
          to { background-color: #fca5a5; }
        }
        .animate-modal { animation: fadeIn 0.3s; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}