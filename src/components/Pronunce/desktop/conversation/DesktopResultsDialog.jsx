import React, { useEffect, useState } from "react";

const DesktopResultsDialog = ({
  show,
  score,
  recognizedText,
  targetText,
  isProcessing,
  isSpeaking,
  isPaused,
  isPlayingRecording,
  isRecordingPaused,
  onRetry,
  onContinue,
  onClose,
  onListenClick,
  onPlayRecording,
  onPauseClick,
  onPauseRecording,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);

  // Animate score circle
  useEffect(() => {
    if (show && score !== null) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [show, score]);

  // Play audio feedback based on score when dialog opens
  useEffect(() => {
    if (show && score !== null && score !== undefined && !audioPlayed) {
      // Play audio feedback after a short delay
      setTimeout(() => {
        if (score < 50) {
          // Play error sound for scores less than 50%
          const audio = new Audio("/wrong-answer-sfx.wav");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } else {
          // Play success sound for scores 50% and above
          const audio = new Audio("/right-answer-sfx.wav");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
        setAudioPlayed(true);
      }, 500);
    }
  }, [show, score, audioPlayed]);

  // Reset audio played state when dialog closes
  useEffect(() => {
    if (!show) {
      setAudioPlayed(false);
    }
  }, [show]);

  // Calculate score circle gradient
  const getScoreCircleStyle = () => {
    const percentage = animatedScore || 0;
    const degrees = (percentage / 100) * 360;

    return {
      background: `conic-gradient(
        var(--sna-primary) 0deg,
        var(--sna-secondary) ${degrees}deg,
        var(--border-light) ${degrees}deg
      )`,
    };
  };

  // Get score color and message
  const getScoreColor = (score) => {
    if (score < 50) return "#ff4757"; // Red for scores less than 50%
    return "#000000"; // Black for scores 50% and above
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent pronunciation!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Keep practicing!";
    return "Try again!";
  };

  if (!show) return null;

  return (
    <div
      className={`dialog-container ${show ? "active" : ""}`}
      id="resultsDialog"
    >
      <div className="dialog-backdrop" onClick={onClose}></div>
      <div className="dialog-content">
        {/* Close Button */}
        <button className="close-btn" title="Close dialog" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* Dialog Header */}
        <div className="dialog-header">
          <div className="dialog-icon">
            <i className="fas fa-microphone"></i>
          </div>
          <h4>Your Pronunciation Review</h4>

          {/* Enhanced Pronunciation Score Circle */}
          <div className="score-circle-container">
            <div
              className={`score-circle ${show ? "animate" : ""}`}
              id="scoreCircle"
              style={getScoreCircleStyle()}
            >
              <div className="score-circle-inner">
                <span
                  className="score-percentage"
                  id="scorePercentage"
                  style={{ color: getScoreColor(animatedScore) }}
                >
                  {isProcessing ? "..." : `${animatedScore}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="results-content">
          <div id="recognizedText" className="recognized-text">
            {isProcessing ? (
              <p>Processing your pronunciation...</p>
            ) : (
              <div>
                <p>
                  <strong>Original:</strong>
                  <br />
                  {targetText}
                </p>
                <p>
                  <strong>You said:</strong>
                  <br />
                  {recognizedText || "No speech detected"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dialog Controls */}
        <div className="dialog-controls">
          {/* Listen Button in Dialog - Shows pause icon when speaking */}
          <button
            className={`control-btn listen-btn ${
              isSpeaking && !isPaused ? "speaking" : ""
            } ${isPaused ? "paused" : ""}`}
            id="listen2Button"
            title={
              isSpeaking
                ? isPaused
                  ? "Resume listening"
                  : "Pause listening"
                : "Listen to example"
            }
            onClick={(e) => {
              e.preventDefault();
              if (isSpeaking) {
                onPauseClick();
              } else {
                onListenClick();
              }
            }}
            disabled={isProcessing}
          >
            <i
              className={`fas ${
                isSpeaking
                  ? isPaused
                    ? "fa-play"
                    : "fa-pause"
                  : "fa-volume-up"
              }`}
            ></i>
          </button>

          {/* Action Buttons */}
          <div className="dialog-buttons">
            <button
              id="retryButton"
              className="btn btn-secondary"
              onClick={onRetry}
              disabled={isProcessing}
            >
              <i className="fas fa-redo"></i> Retry
            </button>
            <button
              id="nextButton"
              className="btn btn-primary"
              onClick={onContinue}
              disabled={isProcessing}
            >
              Continue
            </button>
          </div>

          {/* Play Recording Button in Dialog */}
          <button
            className={`control-btn play-btn ${
              isPlayingRecording && !isRecordingPaused ? "speaking" : ""
            } ${isRecordingPaused ? "paused" : ""}`}
            id="bookmark-icon2"
            title={
              isPlayingRecording
                ? isRecordingPaused
                  ? "Resume recorded audio"
                  : "Pause recorded audio"
                : "Play recorded audio"
            }
            onClick={isPlayingRecording ? onPauseRecording : onPlayRecording}
            disabled={isProcessing}
          >
            <i
              className={`fas ${
                isPlayingRecording
                  ? isRecordingPaused
                    ? "fa-play"
                    : "fa-pause"
                  : "fa-headphones"
              }`}
            ></i>
          </button>
        </div>

        {/* Hidden Pronunciation Score (for compatibility) */}
        <div
          id="pronunciationScore"
          className="pronunciation-score"
          style={{ display: "none" }}
        >
          {score}%
        </div>
      </div>
    </div>
  );
};

export default DesktopResultsDialog;
