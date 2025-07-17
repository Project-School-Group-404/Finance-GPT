import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = '', style = {}, position = 'top-left' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const baseStyle = {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    ...style
  };

  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'inline': ''
  };

  return (
    <button
      onClick={handleBack}
      className={`p-2 rounded hover:opacity-80 transition-opacity ${positionClasses[position]} ${className}`}
      style={baseStyle}
      title="Go back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </button>
  );
};

export default BackButton;
