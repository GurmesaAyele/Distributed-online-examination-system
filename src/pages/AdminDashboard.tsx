import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    is_active: true
  });

  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    date: '',
    duration: 60,
    description: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    // Mock subjects - replace with actual API call
    setSubjects(['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology']);
  }, []);

  const loadDashboardData = () => {
    api.get('/exams/').then((r) => setExams(r.data)).catch(() => {});
    api.get('/admin/stats/').then((r) => setStats(r.data)).catch(() => {});
    api.get('/admin/users/').then((r) => setUsers(r.data)).catch(() => {});
    api.get('/admin/questions/').then((r) => setQuestions(r.data)).catch(() => {});
  };

  // File Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      console.log('File dropped:', file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  // User Management Functions
  const createUser = (userData: any) => {
    return api.post('/admin/users/', userData);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setShowCreateUserModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        is_active: true
      });
      loadDashboardData();
      alert('User created successfully!');
    } catch (error) {
      alert('Error creating user');
    }
  };

  // Exam Creation with File Upload
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const examData = {
        ...newExam,
        subject: selectedSubject
      };
      
      // First create the exam
      const examResponse = await api.post('/exams/', examData);
      
      // If there's an uploaded file, handle it
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('examId', examResponse.data.id);
        
        // Upload the file
        await api.post('/admin/upload-questions/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setShowCreateExamModal(false);
      setNewExam({
        title: '',
        subject: '',
        date: '',
        duration: 60,
        description: ''
      });
      setSelectedSubject('');
      setUploadedFile(null);
      loadDashboardData();
      alert('Exam created successfully!');
    } catch (error) {
      alert('Error creating exam');
    }
  };

  const updateUser = (userId: string, userData: any) => {
    return api.put(`/admin/users/${userId}`, userData);
  };

  const deleteUser = (userId: string) => {
    return api.delete(`/admin/users/${userId}`);
  };

  const resetPassword = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/reset-password`);
      alert('Password reset instructions sent to user');
    } catch (error) {
      alert('Error resetting password');
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      loadDashboardData();
      alert(`Role updated to ${role}`);
    } catch (error) {
      alert('Error updating role');
    }
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

  // Redirect to user dashboard based on role
  const redirectToUserDashboard = (userId: string, role: string) => {
    switch (role) {
      case 'student':
        navigate(`/student/dashboard/${userId}`);
        break;
      case 'examiner':
        navigate(`/examiner/dashboard/${userId}`);
        break;
      case 'admin':
        navigate(`/admin/dashboard/${userId}`);
        break;
      case 'teacher':
        navigate(`/teacher/dashboard/${userId}`);
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Calculate user statistics for dashboard
  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.is_active).length;
    const studentUsers = users.filter(user => user.role === 'student').length;
    const teacherUsers = users.filter(user => user.role === 'teacher').length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const examinerUsers = users.filter(user => user.role === 'examiner').length;

    return {
      totalUsers,
      activeUsers,
      studentUsers,
      teacherUsers,
      adminUsers,
      examinerUsers
    };
  };

  const userStats = getUserStats();

  return (
    <div className="admin-dashboard">
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

            {/* User Management Dashboard - Rectangular Cards */}
            <section className="card">
              <h3>User Management Overview</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Users</h4>
                  <p>{userStats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <h4>Active Users</h4>
                  <p>{userStats.activeUsers}</p>
                </div>
                <div className="stat-card">
                  <h4>Students</h4>
                  <p>{userStats.studentUsers}</p>
                </div>
                <div className="stat-card">
                  <h4>Teachers</h4>
                  <p>{userStats.teacherUsers}</p>
                </div>
                <div className="stat-card">
                  <h4>Admins</h4>
                  <p>{userStats.adminUsers}</p>
                </div>
                <div className="stat-card">
                  <h4>Examiners</h4>
                  <p>{userStats.examinerUsers}</p>
                </div>
              </div>
            </section>

            <section className="card">
              <h3>Recent Exams</h3>
              <div className="row">
                <button 
                  className="btn" 
                  onClick={() => setShowCreateExamModal(true)}
                >
                  + Create Exam
                </button>
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
              <button 
                className="btn" 
                onClick={() => setShowCreateUserModal(true)}
              >
                + Create User Account
              </button>
            </div>
            
            {/* User Stats Dashboard */}
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p>{userStats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Active Users</h4>
                <p>{userStats.activeUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Students</h4>
                <p>{userStats.studentUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Teachers</h4>
                <p>{userStats.teacherUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Admins</h4>
                <p>{userStats.adminUsers}</p>
              </div>
              <div className="stat-card">
                <h4>Examiners</h4>
                <p>{userStats.examinerUsers}</p>
              </div>
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
                      <button 
                        className="btn-sm"
                        onClick={() => redirectToUserDashboard(user.id, user.role)}
                      >
                        View Dashboard
                      </button>
                      <button 
                        className="btn-sm danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            deleteUser(user.id).then(() => loadDashboardData());
                          }
                        }}
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
              <button 
                className="btn" 
                onClick={() => setShowCreateExamModal(true)}
              >
                + Create Exam
              </button>
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
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this exam?')) {
                            deleteExam(exam.id).then(() => loadDashboardData());
                          }
                        }}
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
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this question?')) {
                            deleteQuestion(question.id).then(() => loadDashboardData());
                          }
                        }}
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

        {/* Create Exam Modal with Subjects Dropdown and File Upload */}
        {showCreateExamModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Create New Exam</h3>
              <form onSubmit={handleCreateExam}>
                <div className="form-group">
                  <label>Exam Title:</label>
                  <input
                    type="text"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    required
                    placeholder="Enter exam title"
                  />
                </div>
                
                <div className="form-group">
                  <label>Subject:</label>
                  <select 
                    className="subject-dropdown"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Upload Questions File:</label>
                  <div 
                    className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <i>📁</i>
                    <p>
                      {uploadedFile 
                        ? `Selected: ${uploadedFile.name}`
                        : 'Drag & drop your questions file here or click to browse'
                      }
                    </p>
                    <input
                      id="file-input"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                      accept=".csv,.xlsx,.txt,.pdf,.doc,.docx"
                    />
                  </div>
                  {uploadedFile && (
                    <div className="file-info">
                      <p><strong>Selected file:</strong> {uploadedFile.name}</p>
                      <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      <button 
                        type="button" 
                        className="btn-sm danger"
                        onClick={() => setUploadedFile(null)}
                      >
                        Remove File
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Exam Date:</label>
                  <input
                    type="datetime-local"
                    value={newExam.date}
                    onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes):</label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    placeholder="Enter exam description (optional)"
                    rows={3}
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn">Create Exam</button>
                  <button 
                    type="button" 
                    className="btn secondary"
                    onClick={() => {
                      setShowCreateExamModal(false);
                      setUploadedFile(null);
                      setSelectedSubject('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Create New User Account</h3>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="examiner">Examiner</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.is_active}
                      onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                    />
                    Active Account
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn">Create User</button>
                  <button 
                    type="button" 
                    className="btn secondary"
                    onClick={() => setShowCreateUserModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}