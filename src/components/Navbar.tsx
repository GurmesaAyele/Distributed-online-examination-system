import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css"; // ✅ Import CSS file

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? "active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Exam System
        </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? "✖" : "☰"}
        </button>

        <div className={`nav-links ${isOpen ? "open" : ""}`}>
          <Link to="/student" className={isActive("/student")}>
            Student
          </Link>
          <Link to="/examiner" className={isActive("/examiner")}>
            Examiner
          </Link>
          <Link to="/admin" className={isActive("/admin")}>
            Admin
          </Link>
          <Link to="/exam/1" className={isActive("/exam")}>
            Exam
          </Link>
          <Link to="/results/1" className={isActive("/results")}>
            Results
          </Link>
          <Link to="/profile" className={isActive("/profile")}>
            Profile
          </Link>
          <Link to="/settings" className={isActive("/settings")}>
            Settings
          </Link>
          <Link to="/help" className={isActive("/help")}>
            Help
          </Link>
        </div>
      </div>
    </nav>
  );
}
