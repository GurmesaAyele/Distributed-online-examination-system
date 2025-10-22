// src/pages/admin/Dashboard.tsx
import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserManagement from './UserManagement';
import ExamManagement from './ExamManagement';
import QuestionBank from './QuestionBank';
import Monitoring from './Monitoring';
import Results from './Results';
import './Dashboard.css';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/exams', label: 'Exam Management', icon: '📝' },
    { path: '/admin/questions', label: 'Question Bank', icon: '❓' },
    { path: '/admin/monitoring', label: 'Monitoring', icon: '👁️' },
    { path: '/admin/results', label: 'Results & Reports', icon: '📈' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <div className="user-info">
            <span>Welcome, {user?.first_name} {user?.last_name}</span>
          </div>
        </div>
        
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        <button onClick={handleLogout} className="logout-button">
          🚪 Logout
        </button>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="results" element={<Results />} />
          <Route path="/" element={<Navigate to="dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardHome: React.FC = () => {
  return (
    <div className="dashboard-home">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">150</p>
        </div>
        <div className="stat-card">
          <h3>Active Exams</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <h3>Pending Results</h3>
          <p className="stat-number">5</p>
        </div>
        <div className="stat-card">
          <h3>System Status</h3>
          <p className="stat-number online">Online</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;