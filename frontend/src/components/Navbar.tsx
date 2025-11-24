import React from "react";

interface NavbarProps {
  role: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  return (
    <nav style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        padding: "1rem 2rem", 
        background: "#4f46e5", 
        color: "#fff"
    }}>
      <div>MyApp</div>
      {role && <div>Logged in as: <strong>{role.toUpperCase()}</strong></div>}
    </nav>
  );
};

export default Navbar;
