// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ExaminerDashboard from './pages/examiner/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user, 'Loading:', loading, 'Required Role:', requiredRole);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`User role ${user.role} doesn't match required role ${requiredRole}, redirecting`);
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('AppRoutes - User:', user, 'Loading:', loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />
        } 
      />
      
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/examiner/*" 
        element={
          <ProtectedRoute requiredRole="examiner">
            <ExaminerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <Navigate to={user ? `/${user.role}/dashboard` : '/login'} />
        } 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;