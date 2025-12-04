import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

// Import logo image - make sure to place your logo in the assets folder
import logo from "../assets/logo.png"; // Update this path to your actual logo

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
  const [focusField, setFocusField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          // Reset form after successful registration
          setFormData({
            username: "",
            email: "",
            password: "",
            role: "student",
          });
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
    <div className="login-container">
      {/* Animated background elements */}
      <div className="animated-bg">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      
      {/* Main content */}
      <div className="login-content">
        {/* Page Title */}
        <div className="title-container">
          <h1 className="main-title">
            <span className="title-word title-word-1">Welcome</span>
            <span className="title-word title-word-2">To</span>
            <span className="title-word title-word-3">Software</span>
            <span className="title-word title-word-4">Engineering</span>
            <span className="title-word title-word-5">Examination</span>
            <span className="title-word title-word-6">System</span>
          </h1>
          <div className="title-underline"></div>
        </div>
        
        {/* Logo in center */}
        <div className="logo-container">
          <div className="logo-wrapper">
            <img 
              src={logo} 
              alt="Software Engineering Examination System Logo" 
              className="logo-img"
              onError={(e) => {
                // Fallback if logo image is not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'logo-fallback';
                  fallbackDiv.innerHTML = 'SEES';
                  parent.appendChild(fallbackDiv);
                }
              }}
            />
            <div className="logo-glow"></div>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2 className="form-title">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="form-subtitle">
                {isRegistering 
                  ? "Sign up to access the examination system" 
                  : "Sign in to your account to continue"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className={`input-group ${focusField === 'username' ? 'focused' : ''}`}>
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusField('username')}
                  onBlur={() => setFocusField(null)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
                <div className="input-underline"></div>
              </div>
              
              {isRegistering && (
                <div className={`input-group ${focusField === 'email' ? 'focused' : ''}`}>
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  <div className="input-underline"></div>
                </div>
              )}
              
              <div className={`input-group ${focusField === 'password' ? 'focused' : ''}`}>
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  required
                  disabled={isLoading}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
                <div className="input-underline"></div>
              </div>
              
              {isRegistering && (
                <div className={`input-group ${focusField === 'role' ? 'focused' : ''}`}>
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onFocus={() => setFocusField('role')}
                    onBlur={() => setFocusField(null)}
                    disabled={isLoading}
                    className="role-select"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="input-underline"></div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    {isRegistering ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  <>
                    <span>{isRegistering ? "Sign Up" : "Sign In"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="toggle-section">
              <div className="toggle-divider">
                <span className="toggle-divider-text">
                  {isRegistering ? "Already have an account?" : "Don't have an account?"}
                </span>
              </div>
              
              <button 
                type="button"
                className="toggle-button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                  // Reset form when toggling
                  setFormData({
                    username: "",
                    email: "",
                    password: "",
                    role: "student",
                  });
                }}
                disabled={isLoading}
              >
                {isRegistering ? "Sign In Instead" : "Create New Account"}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            </div>
            
            <div className="login-footer">
              <p className="footer-text">
                Forgot your password? <a href="#" className="footer-link">Reset here</a>
              </p>
              <p className="footer-text">
                Need help? <a href="#" className="footer-link">Contact support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;