import React from "react";

const MobileCompletionCard = ({
  show,
  overallScore,
  onBackToLessons,
  topicCompleted = false,
  lessonCompleted = false,
}) => {
  if (!show) return null;

  return (
    <div className="mobile-completion-card show">
      <div className="completion-content">
        <div className="completion-icon">
          <i
            className={`fas ${
              lessonCompleted
                ? "fa-trophy"
                : topicCompleted
                ? "fa-star"
                : "fa-party-horn"
            }`}
          ></i>
        </div>
        <h3>
          {lessonCompleted
            ? "Lesson Completed!"
            : topicCompleted
            ? "Topic Completed!"
            : "Conversation Completed!"}
        </h3>
        <p>
          {lessonCompleted
            ? "Amazing! You've completed the entire lesson!"
            : topicCompleted
            ? "Excellent! You've completed this topic!"
            : "Great job finishing this conversation"}
        </p>

        <div className="completion-score">
          <div className="score-container">
            <span className="score-label">Your overall score is:</span>
            <span className="score-value" id="mobileFinalScore">
              {overallScore}%
            </span>
          </div>
        </div>

        {lessonCompleted && (
          <div className="bonus-message">
            <p>🎉 The next lesson is now unlocked!</p>
          </div>
        )}

        <button className="completion-btn" onClick={onBackToLessons}>
          Back to Topics
        </button>
      </div>
    </div>
  );
};

export default MobileCompletionCard;
