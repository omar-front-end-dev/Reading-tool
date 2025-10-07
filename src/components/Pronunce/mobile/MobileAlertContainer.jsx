import React from "react";

const MobileAlertContainer = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="mobile-alert-container">
      <div className="mobile-alert-content">
        <p>{message}</p>
        <button className="mobile-alert-close" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default MobileAlertContainer;


