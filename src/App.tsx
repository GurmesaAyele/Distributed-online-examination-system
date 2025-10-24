import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExaminerDashboard from './pages/ExaminerDashboard';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import { AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const auth = useContext(AuthContext);
  if (auth?.loading) return <div className="center">Loading...</div>;
  if (!auth?.user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(auth.user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/examiner/*"
          element={
            <ProtectedRoute roles={['examiner']}>
              <ExaminerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:examId"
          element={
            <ProtectedRoute roles={['student', 'examiner', 'admin']}>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:resultId"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
