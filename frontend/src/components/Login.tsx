import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isRegistering
        ? "http://127.0.0.1:8000/api/register/"
        : "http://127.0.0.1:8000/api/login/";

      const bodyData = isRegistering
        ? {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }
        : {
            username: formData.username,
            password: formData.password,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        if (isRegistering) {
          alert("Registration successful! Please login.");
          setIsRegistering(false);
        } else {
          navigate(`/${data.role.toLowerCase()}`);
        }
      } else {
        setError(data.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }

    setIsLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {isRegistering && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          )}
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {isRegistering && (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          )}
          <button type="submit" disabled={isLoading}>
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
        <div className="toggle-btn">
          {isRegistering ? (
            <button onClick={() => setIsRegistering(false)} disabled={isLoading}>
              Already have an account? Login
            </button>
          ) : (
            <button onClick={() => setIsRegistering(true)} disabled={isLoading}>
              Don't have an account? Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
