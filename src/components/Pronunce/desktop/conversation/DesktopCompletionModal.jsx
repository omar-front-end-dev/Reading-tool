import React from "react";

const DesktopCompletionModal = ({ show, overallScore, onClose }) => {
  if (!show) return null;

  return (
    <div
      className={`dialog-container ${show ? "active" : ""}`}
      id="congratulationModal"
    >
      <div className="dialog-backdrop" onClick={onClose}></div>
      <div className="dialog-content completion-modal-content">
        {/* Close Button */}
        <button className="close-btn" title="Close dialog" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* Dialog Header */}
        <div className="dialog-header">
          <div className="dialog-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <h4>🎉 Congratulations! 🎉</h4>
        </div>

        {/* Celebration Content */}
        <div className="completion-content">
          {/* Celebration Image */}
          <img
            src="https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif"
            alt="Celebration GIF"
            className="congrats-img"
          />
          <p>You've successfully completed this conversation!</p>

          {/* Overall Score Display */}
          <div className="overall-score-container">
            <h4>Overall Score</h4>
            <p id="overallScore" className="overall-score">
              {overallScore}%
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="completion-actions">
          <button
            type="button"
            className="btn btn-primary go-to-topics-btn"
            onClick={onClose}
          >
            <i className="fas fa-arrow-left"></i> Go to Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopCompletionModal;
