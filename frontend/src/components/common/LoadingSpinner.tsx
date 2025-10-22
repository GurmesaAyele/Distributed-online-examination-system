// src/components/common/LoadingSpinner.tsx
import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

export default LoadingSpinner;
