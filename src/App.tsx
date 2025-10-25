import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExaminerDashboard from './pages/ExaminerDashboard';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div>
      {/* Navbar visible on all pages */}
      <Navbar />
      <div className="p-6">
        <Routes>
          {/* All dashboards are accessible directly */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/examiner/*" element={<ExaminerDashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/exam/:examId" element={<ExamPage />} />
          <Route path="/results/:resultId" element={<ResultsPage />} />

          {/* Default route redirects to student dashboard */}
          <Route path="/" element={<Navigate to="/student" replace />} />
        </Routes>
      </div>
    </div>
  );
}
