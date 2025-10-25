import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function AdminDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    api.get('/exams/').then((r) => setExams(r.data)).catch(() => {});
    api.get('/admin/stats/').then((r) => setStats(r.data)).catch(() => {});
    api.get('/admin/users/').then((r) => setUsers(r.data)).catch(() => {});
    api.get('/admin/questions/').then((r) => setQuestions(r.data)).catch(() => {});
  };

  // User Management Functions
  const createUser = (userData: any) => {
    return api.post('/admin/users/', userData);
  };

  const updateUser = (userId: string, userData: any) => {
    return api.put(`/admin/users/${userId}`, userData);
  };

  const deleteUser = (userId: string) => {
    return api.delete(`/admin/users/${userId}`);
  };

  const resetPassword = (userId: string) => {
    return api.post(`/admin/users/${userId}/reset-password`);
  };

  const assignRole = (userId: string, role: string) => {
    return api.put(`/admin/users/${userId}/role`, { role });
  };

  // Exam Management Functions
  const createExam = (examData: any) => {
    return api.post('/exams/', examData);
  };

  const updateExam = (examId: string, examData: any) => {
    return api.put(`/exams/${examId}`, examData);
  };

  const deleteExam = (examId: string) => {
    return api.delete(`/exams/${examId}`);
  };

  const publishExam = (examId: string) => {
    return api.put(`/exams/${examId}/publish`);
  };

  const assignExaminer = (examId: string, examinerId: string) => {
    return api.put(`/exams/${examId}/assign-examiner`, { examinerId });
  };

  // Question Bank Management Functions
  const createQuestion = (questionData: any) => {
    return api.post('/admin/questions/', questionData);
  };

  const updateQuestion = (questionId: string, questionData: any) => {
    return api.put(`/admin/questions/${questionId}`, questionData);
  };

  const deleteQuestion = (questionId: string) => {
    return api.delete(`/admin/questions/${questionId}`);
  };

  const approveQuestion = (questionId: string) => {
    return api.put(`/admin/questions/${questionId}/approve`);
  };

  const categorizeQuestion = (questionId: string, categoryData: any) => {
    return api.put(`/admin/questions/${questionId}/categorize`, categoryData);
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={`tab ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          Exam Management
        </button>
        <button 
          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Question Bank
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <section className="card">
            <h3>Quick Stats</h3>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Users</h4>
                  <p>{stats.total_users}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Exams</h4>
                  <p>{stats.total_exams}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Questions</h4>
                  <p>{stats.total_questions}</p>
                </div>
                <div className="stat-card">
                  <h4>Avg Score</h4>
                  <p>{stats.avg_score}</p>
                </div>
                <div className="stat-card">
                  <h4>Pass Rate</h4>
                  <p>{stats.pass_rate}%</p>
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <h3>Recent Exams</h3>
            <div className="row">
              <Link to="/admin/exams/create" className="btn">+ Create Exam</Link>
            </div>
            <ul>
              {exams.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <strong>{e.title}</strong> — {e.num_questions} questions — 
                  {e.status} — <Link to={`/exam/${e.id}`}>Open</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h3>Analytics</h3>
            {stats ? (
              <div style={{ maxWidth: 600 }}>
                <Bar data={{
                  labels: stats.by_exam.map((s: any) => s.title),
                  datasets: [{ label: 'Avg Score', data: stats.by_exam.map((s:any)=>s.avg_score) }]
                }} />
              </div>
            ) : <div>Loading stats...</div>}
          </section>
        </>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <section className="card">
          <h3>User Management</h3>
          <div className="row">
            <Link to="/admin/users/create" className="btn">+ Add User</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => assignRole(user.id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="examiner">Examiner</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button 
                      className="btn-sm"
                      onClick={() => resetPassword(user.id)}
                    >
                      Reset Password
                    </button>
                    <Link to={`/admin/users/edit/${user.id}`} className="btn-sm">
                      Edit
                    </Link>
                    <button 
                      className="btn-sm danger"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Exam Management Tab */}
      {activeTab === 'exams' && (
        <section className="card">
          <h3>Exam Management</h3>
          <div className="row">
            <Link to="/admin/exams/create" className="btn">+ Create Exam</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{exam.title}</td>
                  <td>{exam.subject}</td>
                  <td>{new Date(exam.date).toLocaleDateString()}</td>
                  <td>{exam.duration} mins</td>
                  <td>{exam.num_questions}</td>
                  <td>{exam.is_published ? 'Published' : 'Draft'}</td>
                  <td>
                    {!exam.is_published && (
                      <button 
                        className="btn-sm"
                        onClick={() => publishExam(exam.id)}
                      >
                        Publish
                      </button>
                    )}
                    <Link to={`/admin/exams/edit/${exam.id}`} className="btn-sm">
                      Edit
                    </Link>
                    <Link to={`/admin/exams/assign/${exam.id}`} className="btn-sm">
                      Assign Examiner
                    </Link>
                    <button 
                      className="btn-sm danger"
                      onClick={() => deleteExam(exam.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Question Bank Tab */}
      {activeTab === 'questions' && (
        <section className="card">
          <h3>Question Bank Management</h3>
          <div className="row">
            <Link to="/admin/questions/create" className="btn">+ Add Question</Link>
          </div>
          <div className="filters">
            <select>
              <option value="">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
            </select>
            <select>
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select>
              <option value="">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="short">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id}>
                  <td>{question.text.substring(0, 100)}...</td>
                  <td>{question.subject}</td>
                  <td>{question.type}</td>
                  <td>{question.difficulty}</td>
                  <td>{question.is_approved ? 'Approved' : 'Pending'}</td>
                  <td>
                    {!question.is_approved && (
                      <button 
                        className="btn-sm"
                        onClick={() => approveQuestion(question.id)}
                      >
                        Approve
                      </button>
                    )}
                    <Link to={`/admin/questions/edit/${question.id}`} className="btn-sm">
                      Edit
                    </Link>
                    <button 
                      className="btn-sm danger"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}