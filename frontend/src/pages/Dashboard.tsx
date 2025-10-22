// src/pages/student/Dashboard.tsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AvailableExams from './AvailableExams';
import ExamHistory from './ExamHistory';
import Profile from '../common/Profile';
import './Dashboard.css';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/exams', label: 'Available Exams', icon: '📝' },
    { path: '/student/history', label: 'Exam History', icon: '📚' },
    { path: '/student/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Student Panel</h2>
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
          <Route path="dashboard" element={<StudentDashboardHome />} />
          <Route path="exams" element={<AvailableExams />} />
          <Route path="history" element={<ExamHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/" element={<Navigate to="dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

const StudentDashboardHome: React.FC = () => {
  return (
    <div className="dashboard-home">
      <h1>Student Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Available Exams</h3>
          <p className="stat-number">5</p>
        </div>
        <div className="stat-card">
          <h3>Exams Taken</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <p className="stat-number">85%</p>
        </div>
        <div className="stat-card">
          <h3>Next Exam</h3>
          <p className="stat-number">Math - Tomorrow</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;