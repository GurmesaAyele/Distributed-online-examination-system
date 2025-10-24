import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const auth = useContext(AuthContext);
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">Distributed Exam</Link>
        {auth?.user && <span className="muted">({auth.user.role})</span>}
      </div>
      <div className="nav-right">
        {auth?.user ? (
          <>
            <span className="muted">{auth.user.username}</span>
            <button className="btn ghost" onClick={() => auth.logout()}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn">Login</Link>
        )}
      </div>
    </nav>
  );
}
