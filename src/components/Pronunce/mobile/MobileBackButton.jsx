import React from "react";

const MobileBackButton = ({ onBackClick }) => {
  return (
    <div className="mobile-back-button">
      <button className="back-btn" onClick={onBackClick}>
        <i className="fas fa-arrow-left"></i>
      </button>
    </div>
  );
};

export default MobileBackButton;


