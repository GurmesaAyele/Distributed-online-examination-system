import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import AdminDashboard from "./pages/Admin/UserManagement";
import StudentDashboard from "./pages/Student/Dashboard";
import ExaminerDashboard from "./pages/Examiner/Dashboard";

// Role-based route protection
const ProtectedRoute = ({ children, role }: { children: JSX.Element; role: string }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/" />;
  if (user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page: login */}
        <Route path="/" element={<Login />} />

        {/* Admin route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student route */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Examiner route */}
        <Route
          path="/examiner/dashboard"
          element={
            <ProtectedRoute role="examiner">
              <ExaminerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
