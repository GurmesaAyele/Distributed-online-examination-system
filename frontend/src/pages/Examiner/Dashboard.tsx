// src/pages/examiner/Dashboard.tsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ExaminerExams from './ExaminerExams';
import MonitorExams from './MonitorExams';
import Profile from '../common/Profile';
import './Dashboard.css';

const ExaminerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { path: '/examiner/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/examiner/exams', label: 'My Exams', icon: '📝' },
    { path: '/examiner/monitor', label: 'Monitor Exams', icon: '👁️' },
    { path: '/examiner/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Examiner Panel</h2>
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
          <Route path="dashboard" element={<ExaminerDashboardHome />} />
          <Route path="exams" element={<ExaminerExams />} />
          <Route path="monitor" element={<MonitorExams />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/" element={<Navigate to="dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

const ExaminerDashboardHome: React.FC = () => {
  return (
    <div className="dashboard-home">
      <h1>Examiner Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>My Exams</h3>
          <p className="stat-number">8</p>
        </div>
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p className="stat-number">3</p>
        </div>
        <div className="stat-card">
          <h3>Pending Evaluation</h3>
          <p className="stat-number">15</p>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">120</p>
        </div>
      </div>
    </div>
  );
};

export default ExaminerDashboard;