import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

type UserRole = "admin" | "teacher" | "student";

interface LoginFormData {
  email: string;
  password: string;
}

const mockUsers: { email: string; password: string; role: UserRole }[] = [
  { email: "admin@example.com", password: "admin123", role: "admin" },
  { email: "teacher@example.com", password: "teacher123", role: "teacher" },
  { email: "student@example.com", password: "student123", role: "student" },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = mockUsers.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      setError("");
      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "student":
          navigate("/student");
          break;
      }
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
