import React from "react";

const DesktopVideoSection = ({
  videoRef,
  currentSentence,
  isPlaying,
  videoLoading,
  videoError,
  onPlay,
  onReplay,
  onVideoEnd,
  onLoadedMetadata,
  onTimeUpdate,
  onVideoPlay, // Video element play event
  onPause,
  onEnded,
  onError,
  onLoadStart,
  onCanPlay,
}) => {
  const handlePlayClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        onPlay();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleReplayClick = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      onReplay();
    }
  };

  return (
    <div className="watch-learn-section">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-play-circle"></i>
        </div>
        <h3>Watch & Learn</h3>
      </div>

      {/* Video Container */}
      <div className="video-container">
        <video
          ref={videoRef}
          className="lesson-video"
          controls
          id="lessonVideo"
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onVideoPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onLoadStart={onLoadStart}
          onCanPlay={onCanPlay}
        >
          <source src={currentSentence?.videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Error Indicator */}
        {videoError && (
          <div className="video-error-overlay">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Video failed to load. Please check your connection.</span>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="video-controls">
        <button
          className="btn btn-outline-primary"
          id="playVideoBtn"
          onClick={handlePlayClick}
          disabled={videoLoading}
        >
          <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
          {isPlaying ? "Pause Video" : "Watch Video"}
        </button>
        <button
          className="btn btn-outline-secondary"
          id="replayVideoBtn"
          onClick={handleReplayClick}
          disabled={videoLoading}
        >
          <i className="fas fa-redo"></i> Replay
        </button>
      </div>
    </div>
  );
};

export default DesktopVideoSection;
