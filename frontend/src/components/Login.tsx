import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const mockUsers = [
  { email: "admin@example.com", password: "admin123", role: "admin" },
  { email: "teacher@example.com", password: "teacher123", role: "teacher" },
  { email: "student@example.com", password: "student123", role: "student" },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      setError("");
      navigate(`/${user.role}`);
    } else {
      setError("Invalid email or password");
    }
    setIsLoading(false);
  };

  return (
    <div className="login-wrapper">
      <header className="main-title">
        <h1>Software Engineering Department</h1>
        <p>Examination System</p>
      </header>

      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={isLoading ? "loading" : ""}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;