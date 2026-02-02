import React from 'react';
import './LoadingSpinner.css';

/**
 * Spinner de carga con variantes
 */

const LoadingSpinner = ({ size = 'medium', message = '', fullscreen = false }) => {
  const spinnerContent = (
    <div className={`loading-spinner-wrapper ${fullscreen ? 'fullscreen' : ''}`}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-chip spinner-chip-1"></div>
        <div className="spinner-chip spinner-chip-2"></div>
        <div className="spinner-chip spinner-chip-3"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  return spinnerContent;
};

export default LoadingSpinner;
