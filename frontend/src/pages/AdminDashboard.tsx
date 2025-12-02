import React, { useEffect, useMemo, useState } from 'react';

// -------------------- Enhanced Types --------------------
type Role = 'student' | 'teacher' | 'admin';

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active?: boolean;
  department?: string;
  lastLogin?: string;
  createdAt: string;
  permissions?: string[];
};

type Permission = 'manage_users' | 'manage_exams' | 'view_reports' | 'send_notifications' | 'monitor_exams';

type QuestionType = 'mcq' | 'truefalse' | 'short' | 'essay' | 'fill';

type Question = {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuestionType;
  text: string;
  choices?: string[];
  correctAnswer?: string;
  marks: number;
  image?: string | null;
  createdAt: string;
};

type Exam = {
  id: string;
  title: string;
  subject: string;
  category: 'midterm' | 'final' | 'quiz' | 'assignment';
  department: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMark: number;
  randomize: boolean;
  published: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  examinerId?: string;
  assignedTo: string[];
  security: {
    faceDetection: boolean;
    browserLockdown: boolean;
    tabSwitchingDetection: boolean;
    copyPasteDisabled: boolean;
  };
  createdAt: string;
};

type LoginAttempt = {
  id: string;
  userId: string;
  email: string;
  timestamp: string;
  ip: string;
  success: boolean;
  userAgent: string;
};

type CheatingAlert = {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  type: 'tab_switch' | 'copy_paste' | 'multiple_faces' | 'unusual_activity';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
};

type Result = {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  submittedAt: string;
  duration: number;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  targetRole: Role | 'all';
  sentBy: string;
  sentAt: string;
  read: boolean;
};

// -------------------- Helpers --------------------
const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

const saveToLS = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));
const loadFromLS = <T,>(k: string, fallback: T) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const generateFakeIP = () => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

// -------------------- Enhanced Mock Data --------------------
const initUsers = (): User[] =>
  loadFromLS<User[]>('demo_users', [
    { id: 'u_admin', name: 'Super Admin', email: 'admin@demo.com', role: 'admin', active: true, department: 'Administration', lastLogin: now(), createdAt: today(), permissions: ['manage_users', 'manage_exams', 'view_reports', 'send_notifications', 'monitor_exams'] },
    { id: 'u_admin2', name: 'Security Admin', email: 'sec@demo.com', role: 'admin', active: true, department: 'Security', lastLogin: now(), createdAt: today(), permissions: ['monitor_exams', 'view_reports'] },
    { id: 'u_teacher1', name: 'Dr. Mathematics', email: 'math@demo.com', role: 'teacher', active: true, department: 'Mathematics', lastLogin: now(), createdAt: today() },
    { id: 'u_teacher2', name: 'Prof. Physics', email: 'physics@demo.com', role: 'teacher', active: true, department: 'Physics', lastLogin: now(), createdAt: today() },
    { id: 'u_student1', name: 'Alice Johnson', email: 'alice@demo.com', role: 'student', active: true, department: 'Computer Science', lastLogin: now(), createdAt: today() },
    { id: 'u_student2', name: 'Bob Williams', email: 'bob@demo.com', role: 'student', active: true, department: 'Computer Science', lastLogin: now(), createdAt: today() },
    { id: 'u_student3', name: 'Charlie Brown', email: 'charlie@demo.com', role: 'student', active: false, department: 'Physics', lastLogin: '2024-01-15', createdAt: '2024-01-01' },
  ]);

const initQuestions = (): Question[] =>
  loadFromLS<Question[]>('demo_questions', [
    { id: uid('q_'), subject: 'Math', topic: 'Algebra', difficulty: 'easy', type: 'mcq', text: 'What is 2+2?', choices: ['3', '4', '22', '5'], correctAnswer: '4', marks: 5, image: null, createdAt: today() },
    { id: uid('q_'), subject: 'Physics', topic: 'Motion', difficulty: 'medium', type: 'short', text: 'State Newton\'s 2nd law.', correctAnswer: 'F=ma', marks: 10, image: null, createdAt: today() },
    { id: uid('q_'), subject: 'CS', topic: 'React', difficulty: 'hard', type: 'essay', text: 'Explain the concept of React Hooks.', marks: 25, image: null, createdAt: today() },
    { id: uid('q_'), subject: 'Math', topic: 'Calculus', difficulty: 'hard', type: 'mcq', text: 'What is the derivative of x²?', choices: ['x', '2x', 'x²', '0'], correctAnswer: '2x', marks: 5, image: null, createdAt: today() },
  ]);

const initExams = (): Exam[] =>
  loadFromLS<Exam[]>('demo_exams', [
    {
      id: 'e_midterm',
      title: 'Midterm Exam - Mathematics',
      subject: 'Mathematics',
      category: 'midterm',
      department: 'Computer Science',
      description: 'Midterm covering algebra and calculus basics',
      date: today(),
      startTime: '09:00',
      endTime: '11:00',
      durationMinutes: 120,
      totalMarks: 100,
      passingMark: 60,
      randomize: true,
      published: true,
      status: 'approved',
      examinerId: 'u_teacher1',
      assignedTo: ['u_student1', 'u_student2'],
      security: {
        faceDetection: true,
        browserLockdown: true,
        tabSwitchingDetection: true,
        copyPasteDisabled: true
      },
      createdAt: today()
    },
    {
      id: 'e_physics',
      title: 'Physics Final Exam',
      subject: 'Physics',
      category: 'final',
      department: 'Physics',
      description: 'Comprehensive final examination',
      date: today(),
      startTime: '14:00',
      endTime: '16:30',
      durationMinutes: 150,
      totalMarks: 150,
      passingMark: 75,
      randomize: true,
      published: false,
      status: 'pending',
      examinerId: 'u_teacher2',
      assignedTo: ['u_student3'],
      security: {
        faceDetection: false,
        browserLockdown: true,
        tabSwitchingDetection: true,
        copyPasteDisabled: true
      },
      createdAt: today()
    }
  ]);

const initLoginAttempts = (): LoginAttempt[] =>
  loadFromLS<LoginAttempt[]>('demo_login_attempts', [
    { id: uid('la_'), userId: 'u_student1', email: 'alice@demo.com', timestamp: now(), ip: generateFakeIP(), success: true, userAgent: 'Chrome/Windows' },
    { id: uid('la_'), userId: 'u_student2', email: 'bob@demo.com', timestamp: now(), ip: generateFakeIP(), success: true, userAgent: 'Firefox/Mac' },
    { id: uid('la_'), userId: 'unknown', email: 'hacker@test.com', timestamp: now(), ip: generateFakeIP(), success: false, userAgent: 'Unknown' },
    { id: uid('la_'), userId: 'unknown', email: 'hacker@test.com', timestamp: now(), ip: generateFakeIP(), success: false, userAgent: 'Unknown' },
    { id: uid('la_'), userId: 'unknown', email: 'hacker@test.com', timestamp: now(), ip: generateFakeIP(), success: false, userAgent: 'Unknown' },
  ]);

const initCheatingAlerts = (): CheatingAlert[] =>
  loadFromLS<CheatingAlert[]>('demo_cheating_alerts', [
    { id: uid('ca_'), studentId: 'u_student1', studentName: 'Alice Johnson', examId: 'e_midterm', examTitle: 'Midterm Exam - Mathematics', type: 'tab_switch', timestamp: now(), severity: 'medium', resolved: false },
    { id: uid('ca_'), studentId: 'u_student2', studentName: 'Bob Williams', examId: 'e_midterm', examTitle: 'Midterm Exam - Mathematics', type: 'copy_paste', timestamp: now(), severity: 'high', resolved: false },
  ]);

const initResults = (): Result[] =>
  loadFromLS<Result[]>('demo_results', [
    { id: uid('r_'), studentId: 'u_student1', studentName: 'Alice Johnson', examId: 'e_midterm', examTitle: 'Midterm Exam - Mathematics', score: 85, totalMarks: 100, percentage: 85, grade: 'A', submittedAt: now(), duration: 110 },
    { id: uid('r_'), studentId: 'u_student2', studentName: 'Bob Williams', examId: 'e_midterm', examTitle: 'Midterm Exam - Mathematics', score: 72, totalMarks: 100, percentage: 72, grade: 'B', submittedAt: now(), duration: 115 },
    { id: uid('r_'), studentId: 'u_student3', studentName: 'Charlie Brown', examId: 'e_physics', examTitle: 'Physics Final Exam', score: 68, totalMarks: 150, percentage: 45, grade: 'F', submittedAt: now(), duration: 145 },
  ]);

const initNotifications = (): Notification[] =>
  loadFromLS<Notification[]>('demo_notifications', [
    { id: uid('n_'), title: 'System Maintenance', message: 'System will be down for maintenance on Saturday from 2-4 AM', targetRole: 'all', sentBy: 'u_admin', sentAt: now(), read: false },
    { id: uid('n_'), title: 'New Exam Created', message: 'Physics Final Exam has been created and is pending approval', targetRole: 'admin', sentBy: 'u_teacher2', sentAt: now(), read: true },
  ]);

// -------------------- User Form Component --------------------
function UserForm({ user, onSave }: { user: User | null; onSave: (u: Omit<User, 'id' | 'createdAt'>) => void }) {
  const [state, setState] = useState<Omit<User, 'id' | 'createdAt'>>(() => ({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    active: user?.active ?? true,
    department: user?.department || '',
    lastLogin: user?.lastLogin || now(),
    permissions: user?.permissions || []
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setState(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setState(prev => ({
      ...prev,
      permissions: checked 
        ? [...(prev.permissions || []), permission]
        : (prev.permissions || []).filter(p => p !== permission)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name || !state.email) return alert('Name and Email are required.');
    onSave(state);
  };

  const permissions: Permission[] = ['manage_users', 'manage_exams', 'view_reports', 'send_notifications', 'monitor_exams'];

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>{user ? 'Edit User' : 'Add New User'}</h3>
      <label>Name: <input name="name" value={state.name} onChange={handleChange} required /></label>
      <label>Email: <input type="email" name="email" value={state.email} onChange={handleChange} required /></label>
      <label>
        Role:
        <select name="role" value={state.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label>Department: <input name="department" value={state.department} onChange={handleChange} /></label>
      <label><input type="checkbox" name="active" checked={state.active} onChange={handleChange} /> Active Account</label>
      
      {state.role === 'admin' && (
        <fieldset>
          <legend>Admin Permissions</legend>
          {permissions.map(perm => (
            <label key={perm} className="permission-checkbox">
              <input 
                type="checkbox" 
                checked={state.permissions?.includes(perm)} 
                onChange={e => handlePermissionChange(perm, e.target.checked)} 
              />
              {perm.replace('_', ' ')}
            </label>
          ))}
        </fieldset>
      )}

      <div className="form-actions">
        <button type="submit">{user ? 'Update User' : 'Create User'}</button>
        {user && <button type="button" onClick={() => alert(`Password reset link sent to ${user.email}`)} className="secondary">Reset Password</button>}
      </div>
    </form>
  );
}

// -------------------- Exam Form Component --------------------
function ExamForm({ exam, users, onSave }: { exam: Exam | null; users: User[]; onSave: (e: Omit<Exam, 'id' | 'createdAt'> | Partial<Exam>) => void }) {
  const [state, setState] = useState<Omit<Exam, 'id' | 'createdAt'> & { assignedTo: string[] }>(() => ({
    title: exam?.title || '',
    subject: exam?.subject || '',
    category: exam?.category || 'quiz',
    department: exam?.department || '',
    description: exam?.description || '',
    date: exam?.date || today(),
    startTime: exam?.startTime || '09:00',
    endTime: exam?.endTime || '11:00',
    durationMinutes: exam?.durationMinutes || 90,
    totalMarks: exam?.totalMarks || 100,
    passingMark: exam?.passingMark || 50,
    randomize: exam?.randomize ?? true,
    published: exam?.published ?? false,
    status: exam?.status || 'draft',
    examinerId: exam?.examinerId || null,
    assignedTo: exam?.assignedTo || [],
    security: exam?.security || {
      faceDetection: true,
      browserLockdown: true,
      tabSwitchingDetection: true,
      copyPasteDisabled: true
    }
  }));

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
  };

  const handleSecurityChange = (key: keyof Exam['security'], value: boolean) => {
    setState(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }));
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
        <label>Category: 
          <select name="category" value={state.category} onChange={handleChange}>
            <option value="quiz">Quiz</option>
            <option value="midterm">Midterm Exam</option>
            <option value="final">Final Exam</option>
            <option value="assignment">Assignment</option>
          </select>
        </label>
        <label>Department: <input name="department" value={state.department} onChange={handleChange} required /></label>
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

      <label>
        Status:
        <select name="status" value={state.status} onChange={handleChange}>
          <option value="draft">Draft</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>

      <fieldset className="security-settings">
        <legend>Security Settings</legend>
        <div className="security-grid">
          <label className="checkbox-label">
            <input type="checkbox" checked={state.security.faceDetection} onChange={e => handleSecurityChange('faceDetection', e.target.checked)} />
            Face Detection
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={state.security.browserLockdown} onChange={e => handleSecurityChange('browserLockdown', e.target.checked)} />
            Browser Lockdown
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={state.security.tabSwitchingDetection} onChange={e => handleSecurityChange('tabSwitchingDetection', e.target.checked)} />
            Tab Switching Detection
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={state.security.copyPasteDisabled} onChange={e => handleSecurityChange('copyPasteDisabled', e.target.checked)} />
            Disable Copy/Paste
          </label>
        </div>
      </fieldset>

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
      </fieldset>

      <div className="form-actions">
        <button type="submit">{exam ? 'Update Exam' : 'Create Exam'}</button>
        {exam && (
          <>
            <button type="button" className="secondary" onClick={() => onSave({ ...exam, status: 'approved' })}>Approve</button>
            <button type="button" className="danger" onClick={() => onSave({ ...exam, status: 'rejected' })}>Reject</button>
          </>
        )}
      </div>
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
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>(initLoginAttempts);
  const [cheatingAlerts, setCheatingAlerts] = useState<CheatingAlert[]>(initCheatingAlerts);
  const [results, setResults] = useState<Result[]>(initResults);
  const [notifications, setNotifications] = useState<Notification[]>(initNotifications);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'exams' | 'questions' | 'monitor' | 'reports' | 'settings' | 'notifications'>('overview');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(notifications.filter(n => !n.read).length);

  // Save to localStorage
  useEffect(() => saveToLS('demo_users', users), [users]);
  useEffect(() => saveToLS('demo_questions', questions), [questions]);
  useEffect(() => saveToLS('demo_exams', exams), [exams]);
  useEffect(() => saveToLS('demo_login_attempts', loginAttempts), [loginAttempts]);
  useEffect(() => saveToLS('demo_cheating_alerts', cheatingAlerts), [cheatingAlerts]);
  useEffect(() => saveToLS('demo_results', results), [results]);
  useEffect(() => saveToLS('demo_notifications', notifications), [notifications]);

  // Derived counts
  const counts = useMemo(() => ({
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
    exams: exams.length,
    questions: questions.length,
    activeExams: exams.filter(e => e.published && e.status === 'approved').length,
    pendingExams: exams.filter(e => e.status === 'pending').length,
    cheatingAlerts: cheatingAlerts.filter(c => !c.resolved).length,
    failedLogins: loginAttempts.filter(l => !l.success).length,
  }), [users, exams, questions, cheatingAlerts, loginAttempts]);

  // Performance analytics
  const performanceSummary = useMemo(() => {
    const totalStudents = counts.students;
    const avgScore = results.length > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
    const passRate = results.length > 0 ? results.filter(r => r.percentage >= 60).length / results.length : 0;
    
    const departmentStats = users
      .filter(u => u.role === 'student')
      .reduce((acc, user) => {
        const dept = user.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const scoreDistribution = {
      'A (90-100)': results.filter(r => r.percentage >= 90).length,
      'B (80-89)': results.filter(r => r.percentage >= 80 && r.percentage < 90).length,
      'C (70-79)': results.filter(r => r.percentage >= 70 && r.percentage < 80).length,
      'D (60-69)': results.filter(r => r.percentage >= 60 && r.percentage < 70).length,
      'F (<60)': results.filter(r => r.percentage < 60).length,
    };

    return {
      avgScore: Math.round(avgScore),
      passRate,
      totalStudents,
      departmentStats,
      scoreDistribution,
      topPerformer: results.length > 0 ? results.reduce((best, curr) => curr.percentage > best.percentage ? curr : best) : null,
    };
  }, [users, results]);

  // -------------------- Handlers --------------------
  function addUser(payload: Omit<User, 'id' | 'createdAt'>) {
    const u: User = { ...payload, id: uid('u_'), createdAt: today() };
    setUsers(prev => [u, ...prev]);
  }

  function updateUser(id: string, patch: Partial<User>) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }

  function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function createExam(payload: Omit<Exam, 'id' | 'createdAt'>) {
    const e: Exam = { ...payload, id: uid('e_'), createdAt: today() };
    setExams(prev => [e, ...prev]);
  }

  function updateExam(id: string, patch: Partial<Exam>) {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }

  function deleteExam(id: string) {
    if (!confirm('Delete this exam?')) return;
    setExams(prev => prev.filter(e => e.id !== id));
  }

  function addQuestion(q: Omit<Question, 'id' | 'createdAt'>) {
    const n = { ...q, id: uid('q_'), createdAt: today() };
    setQuestions(prev => [n, ...prev]);
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function deleteQuestion(id: string) {
    if (!confirm('Delete this question?')) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function resolveCheatingAlert(id: string) {
    setCheatingAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  }

  function sendNotification({ title, message, targetRole }: { title: string; message: string; targetRole: Role | 'all' }) {
    const notification: Notification = {
      id: uid('n_'),
      title,
      message,
      targetRole,
      sentBy: 'u_admin',
      sentAt: now(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadNotifications(prev => prev + 1);
    alert(`Notification sent to ${targetRole}: ${title}`);
  }

  function markNotificationAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  }

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

  // -------------------- Monitoring Simulation --------------------
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new cheating alerts
      if (Math.random() < 0.05) {
        const students = users.filter(u => u.role === 'student' && u.active);
        if (students.length > 0) {
          const student = students[Math.floor(Math.random() * students.length)];
          const activeExams = exams.filter(e => e.published && e.assignedTo.includes(student.id));
          if (activeExams.length > 0) {
            const exam = activeExams[Math.floor(Math.random() * activeExams.length)];
            const types: CheatingAlert['type'][] = ['tab_switch', 'copy_paste', 'multiple_faces', 'unusual_activity'];
            const newAlert: CheatingAlert = {
              id: uid('ca_'),
              studentId: student.id,
              studentName: student.name,
              examId: exam.id,
              examTitle: exam.title,
              type: types[Math.floor(Math.random() * types.length)],
              timestamp: now(),
              severity: Math.random() < 0.3 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low',
              resolved: false
            };
            setCheatingAlerts(prev => [newAlert, ...prev]);
          }
        }
      }

      // Simulate login attempts
      if (Math.random() < 0.1) {
        const newAttempt: LoginAttempt = {
          id: uid('la_'),
          userId: 'unknown',
          email: `suspicious${Math.floor(Math.random() * 1000)}@test.com`,
          timestamp: now(),
          ip: generateFakeIP(),
          success: Math.random() < 0.3,
          userAgent: Math.random() < 0.5 ? 'Chrome/Windows' : 'Unknown'
        };
        setLoginAttempts(prev => [newAttempt, ...prev.slice(0, 49)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [users, exams]);

  // -------------------- UI Components --------------------
  function StatCard({ label, value, icon, trend }: { label: string; value: string | number; icon: string; trend?: number }) {
    return (
      <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
          {trend !== undefined && (
            <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------- Render --------------------
  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="brand">ExamMaster Admin 🎓</div>
        <div className="user-info">
          <div className="user-avatar">SA</div>
          <div className="user-details">
            <strong>Super Admin</strong>
            <small>Administrator</small>
          </div>
        </div>
        <nav>
          <button className={activeTab==='overview'? 'active':''} onClick={() => setActiveTab('overview')}>
            📊 Dashboard
          </button>
          <button className={activeTab==='users'? 'active':''} onClick={() => setActiveTab('users')}>
            👥 User Management
            <span className="badge">{counts.admins + counts.teachers + counts.students}</span>
          </button>
          <button className={activeTab==='exams'? 'active':''} onClick={() => setActiveTab('exams')}>
            📝 Exam Management
            {counts.pendingExams > 0 && <span className="badge warn">{counts.pendingExams}</span>}
          </button>
          <button className={activeTab==='questions'? 'active':''} onClick={() => setActiveTab('questions')}>
            📚 Question Bank
          </button>
          <button className={activeTab==='monitor'? 'active':''} onClick={() => setActiveTab('monitor')}>
            💻 Live Monitoring
            {counts.cheatingAlerts > 0 && <span className="badge danger">{counts.cheatingAlerts}</span>}
          </button>
          <button className={activeTab==='reports'? 'active':''} onClick={() => setActiveTab('reports')}>
            📈 Reports & Analytics
          </button>
          <button className={activeTab==='notifications'? 'active':''} onClick={() => setActiveTab('notifications')}>
            🔔 Notifications
            {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
          </button>
          <button className={activeTab==='settings'? 'active':''} onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot online"></span>
            System Online
          </div>
          <small>v2.1.0</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search">
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search users, exams, questions..." 
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="actions">
            <button className="btn-primary" onClick={() => { setSelectedUser(null); setActiveTab('users'); setShowModal(true); }}>
              + Add User
            </button>
            <button className="btn-primary" onClick={() => { setSelectedExam(null); setActiveTab('exams'); setShowModal(true); }}>
              + Create Exam
            </button>
            <div className="notification-bell">
              <span>🔔</span>
              {unreadNotifications > 0 && <span className="notification-count">{unreadNotifications}</span>}
            </div>
          </div>
        </header>

        <div className="content">
          {/* Dashboard Overview */}
          {activeTab === 'overview' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>Dashboard Overview</h2>
                <div className="time-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              
              <div className="stats-grid">
                <StatCard label="Total Students" value={counts.students} icon="👨‍🎓" trend={2.5} />
                <StatCard label="Active Teachers" value={counts.teachers} icon="👩‍🏫" trend={1.2} />
                <StatCard label="Active Exams" value={counts.activeExams} icon="🚀" trend={5.7} />
                <StatCard label="Pending Approvals" value={counts.pendingExams} icon="⏳" />
                <StatCard label="Cheating Alerts" value={counts.cheatingAlerts} icon="⚠️" />
                <StatCard label="Avg Score" value={`${performanceSummary.avgScore}%`} icon="📊" trend={performanceSummary.avgScore > 70 ? 3.2 : -1.5} />
              </div>

              <div className="grid">
                <div className="card">
                  <h3>Recent Cheating Alerts</h3>
                  <div className="alert-list">
                    {cheatingAlerts.filter(a => !a.resolved).slice(0, 5).map(alert => (
                      <div key={alert.id} className={`alert-item ${alert.severity}`}>
                        <div className="alert-header">
                          <strong>{alert.studentName}</strong>
                          <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                        </div>
                        <div className="alert-details">
                          {alert.examTitle} • {alert.type.replace('_', ' ')}
                        </div>
                        <div className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                        <button className="btn-sm" onClick={() => resolveCheatingAlert(alert.id)}>Resolve</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3>Recent Login Attempts</h3>
                  <table className="table compact">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>IP</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginAttempts.slice(0, 5).map(attempt => (
                        <tr key={attempt.id}>
                          <td>{attempt.email}</td>
                          <td>{attempt.ip}</td>
                          <td>
                            <span className={`status-badge ${attempt.success ? 'success' : 'danger'}`}>
                              {attempt.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td>{new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3>Performance Summary</h3>
                  <div className="performance-stats">
                    <div className="performance-metric">
                      <div className="metric-label">Average Score</div>
                      <div className="metric-value">{performanceSummary.avgScore}%</div>
                      <div className="metric-progress">
                        <div className="progress-bar" style={{ width: `${performanceSummary.avgScore}%` }}></div>
                      </div>
                    </div>
                    <div className="performance-metric">
                      <div className="metric-label">Pass Rate</div>
                      <div className="metric-value">{(performanceSummary.passRate * 100).toFixed(1)}%</div>
                      <div className="metric-progress">
                        <div className="progress-bar" style={{ width: `${performanceSummary.passRate * 100}%` }}></div>
                      </div>
                    </div>
                    {performanceSummary.topPerformer && (
                      <div className="top-performer">
                        <div className="metric-label">Top Performer</div>
                        <div className="performer-info">
                          <strong>{performanceSummary.topPerformer.studentName}</strong>
                          <span>{performanceSummary.topPerformer.percentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3>Upcoming Exams</h3>
                  <div className="exam-list">
                    {exams.filter(e => e.status === 'approved').slice(0, 3).map(exam => (
                      <div key={exam.id} className="exam-item">
                        <div className="exam-title">{exam.title}</div>
                        <div className="exam-details">
                          <span>{exam.date} • {exam.startTime}</span>
                          <span className={`status-badge ${exam.published ? 'success' : 'warning'}`}>
                            {exam.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>👥 User Management</h2>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => { setSelectedUser(null); setShowModal(true); }}>
                    + Add New User
                  </button>
                  <button className="btn-secondary" onClick={() => exportCSV(users, 'users.csv')}>
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => 
                        u.name.toLowerCase().includes(query.toLowerCase()) || 
                        u.email.toLowerCase().includes(query.toLowerCase())
                      ).map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar small">{user.name.charAt(0)}</div>
                              {user.name}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.department || '-'}</td>
                          <td>
                            <span className={`status-badge ${user.active ? 'success' : 'danger'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-sm" onClick={() => { setSelectedUser(user); setShowModal(true); }}>
                                Edit
                              </button>
                              <button className="btn-sm warn" onClick={() => alert(`Password reset link sent to ${user.email}`)}>
                                Reset PW
                              </button>
                              <button className="btn-sm danger" onClick={() => deleteUser(user.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Exam Management */}
          {activeTab === 'exams' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>📝 Exam Management</h2>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => { setSelectedExam(null); setShowModal(true); }}>
                    + Create Exam
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="tabs">
                  <button className="tab active">All Exams ({exams.length})</button>
                  <button className="tab">Pending ({exams.filter(e => e.status === 'pending').length})</button>
                  <button className="tab">Approved ({exams.filter(e => e.status === 'approved').length})</button>
                  <button className="tab">Published ({exams.filter(e => e.published).length})</button>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Department</th>
                        <th>Date/Time</th>
                        <th>Status</th>
                        <th>Security</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.filter(e => 
                        e.title.toLowerCase().includes(query.toLowerCase()) || 
                        e.subject.toLowerCase().includes(query.toLowerCase())
                      ).map(exam => (
                        <tr key={exam.id}>
                          <td>
                            <div className="exam-title-cell">
                              <strong>{exam.title}</strong>
                              <small>{exam.subject}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`category-badge ${exam.category}`}>
                              {exam.category}
                            </span>
                          </td>
                          <td>{exam.department}</td>
                          <td>
                            {exam.date} @ {exam.startTime}
                            <br/>
                            <small>{exam.durationMinutes} mins</small>
                          </td>
                          <td>
                            <span className={`status-badge ${exam.status}`}>
                              {exam.status}
                            </span>
                            {exam.published && <span className="status-badge success">Published</span>}
                          </td>
                          <td>
                            <div className="security-icons">
                              {exam.security.faceDetection && <span title="Face Detection">👁️</span>}
                              {exam.security.browserLockdown && <span title="Browser Lockdown">🔒</span>}
                              {exam.security.tabSwitchingDetection && <span title="Tab Switching Detection">🔍</span>}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-sm" onClick={() => { setSelectedExam(exam); setShowModal(true); }}>
                                Edit
                              </button>
                              <button className="btn-sm secondary" onClick={() => updateExam(exam.id, { published: !exam.published })}>
                                {exam.published ? 'Unpublish' : 'Publish'}
                              </button>
                              {exam.status === 'pending' && (
                                <>
                                  <button className="btn-sm success" onClick={() => updateExam(exam.id, { status: 'approved' })}>
                                    Approve
                                  </button>
                                  <button className="btn-sm danger" onClick={() => updateExam(exam.id, { status: 'rejected' })}>
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Question Bank */}
          {activeTab === 'questions' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>📚 Question Bank</h2>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => {
                    const sample: Omit<Question, 'id' | 'createdAt'> = { 
                      subject: 'New', 
                      topic: 'General', 
                      difficulty: 'easy', 
                      type: 'mcq', 
                      text: 'New Question Text...', 
                      choices: ['A', 'B', 'C', 'D'], 
                      correctAnswer: 'A',
                      marks: 5,
                      image: null 
                    };
                    addQuestion(sample);
                  }}>
                    + Add Question
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="filters">
                  <select>
                    <option>All Subjects</option>
                    <option>Math</option>
                    <option>Physics</option>
                    <option>CS</option>
                  </select>
                  <select>
                    <option>All Difficulty</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                  <select>
                    <option>All Types</option>
                    <option>MCQ</option>
                    <option>Short Answer</option>
                    <option>Essay</option>
                  </select>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Subject</th>
                        <th>Topic</th>
                        <th>Type</th>
                        <th>Difficulty</th>
                        <th>Marks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.filter(q => 
                        q.text.toLowerCase().includes(query.toLowerCase()) || 
                        q.subject.toLowerCase().includes(query.toLowerCase())
                      ).map(question => (
                        <tr key={question.id}>
                          <td>
                            <div className="question-text">{question.text.substring(0, 80)}...</div>
                          </td>
                          <td>{question.subject}</td>
                          <td>{question.topic}</td>
                          <td>
                            <span className={`type-badge ${question.type}`}>
                              {question.type.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`difficulty-badge ${question.difficulty}`}>
                              {question.difficulty}
                            </span>
                          </td>
                          <td>{question.marks}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-sm" onClick={() => {
                                const newText = prompt('Edit question text', question.text);
                                if (newText) updateQuestion(question.id, { text: newText });
                              }}>
                                Edit
                              </button>
                              <button className="btn-sm danger" onClick={() => deleteQuestion(question.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Live Monitoring */}
          {activeTab === 'monitor' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>💻 Live Exam Monitoring</h2>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => alert('Starting live monitoring session...')}>
                    🔴 Start Monitoring
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="monitor-header">
                  <h3>Active Exam Sessions</h3>
                  <div className="monitor-stats">
                    <span className="stat">👁️ {counts.cheatingAlerts} Active Alerts</span>
                    <span className="stat">👥 {counts.students} Students Online</span>
                    <span className="stat">📊 {performanceSummary.avgScore}% Avg Progress</span>
                  </div>
                </div>

                <div className="monitor-grid">
                  {users.filter(u => u.role === 'student' && u.active).map(student => {
                    const studentExams = exams.filter(e => e.assignedTo.includes(student.id) && e.published);
                    const studentAlerts = cheatingAlerts.filter(a => a.studentId === student.id && !a.resolved);
                    const studentResult = results.find(r => r.studentId === student.id);
                    const isOnline = Math.random() > 0.3;
                    const progress = Math.floor(Math.random() * 100);
                    
                    return (
                      <div key={student.id} className={`monitor-card ${isOnline ? 'online' : 'offline'} ${studentAlerts.length > 0 ? 'alert' : ''}`}>
                        <div className="monitor-card-header">
                          <div className="student-info">
                            <div className="student-avatar">{student.name.charAt(0)}</div>
                            <div>
                              <strong>{student.name}</strong>
                              <small>{student.department}</small>
                            </div>
                          </div>
                          <div className="student-status">
                            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>

                        {isOnline && studentExams.length > 0 && (
                          <>
                            <div className="exam-info">
                              <div className="exam-title">{studentExams[0].title}</div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                              </div>
                              <div className="progress-text">Progress: {progress}%</div>
                            </div>

                            {studentAlerts.length > 0 && (
                              <div className="alerts-section">
                                {studentAlerts.map(alert => (
                                  <div key={alert.id} className="alert-banner">
                                    ⚠️ {alert.type.replace('_', ' ')} ({alert.severity})
                                    <button className="btn-sm" onClick={() => resolveCheatingAlert(alert.id)}>Resolve</button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="monitor-actions">
                              <button className="btn-sm" onClick={() => alert(`Force submit for ${student.name}`)}>
                                Force Submit
                              </button>
                              <button className="btn-sm warn" onClick={() => alert(`Warning sent to ${student.name}`)}>
                                Send Warning
                              </button>
                              <button className="btn-sm danger" onClick={() => alert(`${student.name} flagged for review`)}>
                                Flag Review
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Reports & Analytics */}
          {activeTab === 'reports' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>📈 Reports & Analytics</h2>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => exportCSV(results, 'results.csv')}>
                    📥 Export Results
                  </button>
                  <button className="btn-secondary" onClick={() => exportJSON(results, 'analytics.json')}>
                    📊 Export Analytics
                  </button>
                </div>
              </div>

              <div className="grid">
                <div className="card">
                  <h3>Performance Analytics</h3>
                  <div className="chart-container">
                    <div className="chart-title">Score Distribution</div>
                    <div className="bar-chart">
                      {Object.entries(performanceSummary.scoreDistribution).map(([range, count]) => (
                        <div key={range} className="bar-item">
                          <div className="bar-label">{range}</div>
                          <div className="bar-track">
                            <div 
                              className="bar-fill" 
                              style={{ 
                                width: `${(count / results.length) * 100}%`,
                                backgroundColor: range.includes('A') ? '#10b981' : 
                                               range.includes('B') ? '#3b82f6' : 
                                               range.includes('C') ? '#f59e0b' : 
                                               range.includes('D') ? '#f97316' : '#ef4444'
                              }}
                            ></div>
                          </div>
                          <div className="bar-value">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Department Statistics</h3>
                  <div className="department-stats">
                    {Object.entries(performanceSummary.departmentStats).map(([dept, count]) => (
                      <div key={dept} className="department-item">
                        <div className="dept-name">{dept}</div>
                        <div className="dept-count">{count} students</div>
                        <div className="dept-progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${(count / counts.students) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3>Recent Results</h3>
                  <div className="table-responsive">
                    <table className="table compact">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Exam</th>
                          <th>Score</th>
                          <th>Grade</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 8).map(result => (
                          <tr key={result.id}>
                            <td>{result.studentName}</td>
                            <td>{result.examTitle}</td>
                            <td>
                              <div className="score-cell">
                                {result.score}/{result.totalMarks}
                                <span className="percentage">({result.percentage}%)</span>
                              </div>
                            </td>
                            <td>
                              <span className={`grade-badge ${result.grade}`}>
                                {result.grade}
                              </span>
                            </td>
                            <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>🔔 Notifications</h2>
              </div>

              <div className="grid">
                <div className="card">
                  <h3>Send New Notification</h3>
                  <NotificationForm onSend={sendNotification} />
                </div>

                <div className="card">
                  <h3>Notification History</h3>
                  <div className="notification-list">
                    {notifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                        <div className="notification-header">
                          <strong>{notification.title}</strong>
                          {!notification.read && (
                            <button className="btn-xs" onClick={() => markNotificationAsRead(notification.id)}>
                              Mark Read
                            </button>
                          )}
                        </div>
                        <div className="notification-body">
                          {notification.message}
                        </div>
                        <div className="notification-footer">
                          <small>To: {notification.targetRole}</small>
                          <small>{new Date(notification.sentAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <section className="animate-in">
              <div className="page-header">
                <h2>⚙️ System Settings & Security</h2>
              </div>

              <div className="grid">
                <div className="card">
                  <h3>Security Settings</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        Enable Face Detection
                      </label>
                      <small>Uses webcam to verify student identity</small>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        Browser Lockdown Mode
                      </label>
                      <small>Prevents switching tabs or opening new windows</small>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        Detect Tab Switching
                      </label>
                      <small>Flags students who switch tabs during exam</small>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        Disable Copy/Paste
                      </label>
                      <small>Prevents copying questions or answers</small>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        IP Change Detection
                      </label>
                      <small>Flags suspicious IP changes during exam</small>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>System Configuration</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Auto Backup Frequency</label>
                      <select>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Session Timeout (minutes)</label>
                      <input type="number" defaultValue="30" min="5" max="120" />
                    </div>
                    <div className="form-group">
                      <label>Maximum Login Attempts</label>
                      <input type="number" defaultValue="5" min="1" max="10" />
                    </div>
                    <div className="form-group">
                      <label>Password Policy</label>
                      <select>
                        <option>Strong (8+ chars, mixed case, numbers, symbols)</option>
                        <option>Medium (6+ chars, mixed case)</option>
                        <option>Basic (4+ chars)</option>
                      </select>
                    </div>
                    <button className="btn-primary">Save Settings</button>
                  </div>
                </div>
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
              <UserForm user={selectedUser} onSave={(u) => { 
                if (selectedUser) updateUser(selectedUser.id, u); 
                else addUser(u as any); 
                setShowModal(false); 
              }} />
            )}
            {activeTab === 'exams' && (
              <ExamForm exam={selectedExam} users={users} onSave={(e) => { 
                if (selectedExam) updateExam(selectedExam.id, e as any); 
                else createExam(e as any); 
                setShowModal(false); 
              }} />
            )}
          </div>
        </div>
      )}

      {/* -------------------- Enhanced CSS Styling -------------------- */}
      <style>{`
        /* Enhanced Color Scheme */
        :root {
          --primary: #4f46e5;
          --primary-light: #6366f1;
          --primary-dark: #4338ca;
          --secondary: #8b5cf6;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --info: #06b6d4;
          --dark: #0f172a;
          --light: #f8fafc;
          --gray: #64748b;
          --gray-light: #e2e8f0;
          --card-bg: #ffffff;
          --sidebar-bg: #1e293b;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        body {
          background: var(--light);
          color: var(--dark);
          line-height: 1.6;
        }

        .admin-app {
          display: flex;
          min-height: 100vh;
          background: var(--light);
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--sidebar-bg);
          color: white;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        .brand {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: var(--primary-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .user-avatar.small {
          width: 32px;
          height: 32px;
          font-size: 0.9rem;
        }

        .user-details small {
          color: var(--gray-light);
          font-size: 0.85rem;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        nav button {
          background: transparent;
          border: none;
          color: #cbd5e1;
          padding: 0.875rem 1rem;
          text-align: left;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        nav button:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        nav button.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .badge {
          background: var(--primary);
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          min-width: 20px;
          text-align: center;
        }

        .badge.danger {
          background: var(--danger);
        }

        .badge.warn {
          background: var(--warning);
        }

        .sidebar-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.85rem;
          color: var(--gray-light);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success);
        }

        .status-dot.online {
          background: var(--success);
        }

        .status-dot.offline {
          background: var(--danger);
        }

        /* Main Content */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .topbar {
          padding: 1rem 2rem;
          background: white;
          border-bottom: 1px solid var(--gray-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .search {
          position: relative;
          flex: 1;
          max-width: 500px;
        }

        .search input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid var(--gray-light);
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .search input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-bell {
          position: relative;
          cursor: pointer;
          font-size: 1.25rem;
        }

        .notification-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--danger);
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          min-width: 18px;
          text-align: center;
        }

        .content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        /* Buttons */
        button {
          cursor: pointer;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-secondary {
          background: var(--gray-light);
          color: var(--dark);
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-xs {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .btn-success {
          background: var(--success);
          color: white;
        }

        .btn-warn {
          background: var(--warning);
          color: white;
        }

        .btn-danger {
          background: var(--danger);
          color: white;
        }

        /* Cards */
        .card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 1.5rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary-light), var(--secondary));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--dark);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--gray);
          margin-top: 0.25rem;
        }

        .stat-trend {
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .stat-trend.positive {
          color: var(--success);
        }

        .stat-trend.negative {
          color: var(--danger);
        }

        /* Grid Layout */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* Tables */
        .table-responsive {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          background: var(--light);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--dark);
          border-bottom: 2px solid var(--gray-light);
          white-space: nowrap;
        }

        .table td {
          padding: 1rem;
          border-bottom: 1px solid var(--gray-light);
          vertical-align: middle;
        }

        .table tr:hover {
          background: rgba(79, 70, 229, 0.02);
        }

        .table.compact th,
        .table.compact td {
          padding: 0.75rem;
        }

        /* Badges */
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.success {
          background: #d1fae5;
          color: var(--success);
        }

        .status-badge.danger {
          background: #fee2e2;
          color: var(--danger);
        }

        .status-badge.warning {
          background: #fef3c7;
          color: var(--warning);
        }

        .status-badge.info {
          background: #dbeafe;
          color: var(--info);
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-badge.admin {
          background: #ede9fe;
          color: var(--primary);
        }

        .role-badge.teacher {
          background: #e0f2fe;
          color: var(--info);
        }

        .role-badge.student {
          background: #dcfce7;
          color: var(--success);
        }

        /* Monitor Cards */
        .monitor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .monitor-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid var(--gray-light);
          transition: all 0.3s;
        }

        .monitor-card.online {
          border-color: var(--success);
        }

        .monitor-card.offline {
          border-color: var(--gray);
          opacity: 0.7;
        }

        .monitor-card.alert {
          border-color: var(--danger);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .monitor-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          height: 8px;
          background: var(--gray-light);
          border-radius: 4px;
          overflow: hidden;
          margin: 0.5rem 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 4px;
          transition: width 0.3s;
        }

        .monitor-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        /* Forms */
        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-weight: 500;
        }

        .form input,
        .form select,
        .form textarea {
          padding: 0.75rem;
          border: 2px solid var(--gray-light);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .form input:focus,
        .form select:focus,
        .form textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .security-settings {
          border: 1px solid var(--gray-light);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        /* Modal */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s;
        }

        .modal-inner {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s;
        }

        .modal-inner.large-modal {
          max-width: 800px;
        }

        .close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: var(--gray);
          cursor: pointer;
          padding: 0.5rem;
        }

        .close:hover {
          color: var(--danger);
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-modal {
          animation: fadeIn 0.3s;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sidebar {
            width: 70px;
            padding: 1rem;
          }
          
          .brand,
          .user-info,
          .user-details,
          nav button span:not(.badge) {
            display: none;
          }
          
          nav button {
            justify-content: center;
            padding: 0.75rem;
          }
          
          .badge {
            position: absolute;
            top: 5px;
            right: 5px;
          }
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .monitor-grid {
            grid-template-columns: 1fr;
          }
          
          .topbar {
            flex-direction: column;
            gap: 1rem;
          }
          
          .search {
            max-width: 100%;
          }
        }

        /* Utility Classes */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .exam-title-cell {
          display: flex;
          flex-direction: column;
        }

        .exam-title-cell small {
          color: var(--gray);
          font-size: 0.875rem;
        }

        .security-icons {
          display: flex;
          gap: 0.5rem;
          font-size: 1.25rem;
        }

        .question-text {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Alert Items */
        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .alert-item {
          background: #fef2f2;
          border-left: 4px solid var(--danger);
          padding: 1rem;
          border-radius: 8px;
        }

        .alert-item.high {
          background: #fef2f2;
          border-left-color: var(--danger);
        }

        .alert-item.medium {
          background: #fffbeb;
          border-left-color: var(--warning);
        }

        .alert-item.low {
          background: #f0f9ff;
          border-left-color: var(--info);
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .severity-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .severity-badge.high {
          background: #fee2e2;
          color: var(--danger);
        }

        .severity-badge.medium {
          background: #fef3c7;
          color: var(--warning);
        }

        .severity-badge.low {
          background: #dbeafe;
          color: var(--info);
        }

        /* Performance Metrics */
        .performance-stats {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .performance-metric {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: var(--gray);
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dark);
        }

        /* Charts */
        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .bar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bar-label {
          width: 100px;
          font-size: 0.875rem;
          color: var(--dark);
        }

        .bar-track {
          flex: 1;
          height: 20px;
          background: var(--gray-light);
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1s ease-out;
        }

        .bar-value {
          width: 40px;
          text-align: right;
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--gray-light);
          padding-bottom: 0.5rem;
        }

        .tab {
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          color: var(--gray);
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
        }

        .tab:hover {
          background: var(--gray-light);
        }

        .tab.active {
          background: var(--primary);
          color: white;
        }

        /* Settings */
        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .setting-item label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          cursor: pointer;
        }

        .setting-item small {
          color: var(--gray);
          font-size: 0.875rem;
          margin-left: 2rem;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem;
          border: 2px solid var(--gray-light);
          border-radius: 8px;
          font-size: 0.95rem;
        }

        /* Notification Items */
        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--gray-light);
        }

        .notification-item.unread {
          background: #f0f9ff;
          border-color: var(--info);
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .notification-body {
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        .notification-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--gray);
        }
      `}</style>
    </div>
  );
}