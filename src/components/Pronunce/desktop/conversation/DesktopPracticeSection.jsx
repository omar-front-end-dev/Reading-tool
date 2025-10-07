import React from "react";
import DesktopRecordingUI from "./DesktopRecordingUI";
import SpinnerLoadingIcon from "../../SpinnerLoadingIcon";

const DesktopPracticeSection = ({
  currentSentence,
  isRecording,
  isSpeaking,
  isPaused,
  isPlayingRecording,
  isRecordingPaused,
  onListenClick,
  onMicClick,
  onPlayRecording,
  onPauseClick,
  onPauseRecording,
  showRecordingUI,
  recordingTime,
  onStopRecording,
  onDeleteRecording,
  isRecordingCancelled,
  audioStream,
  isProcessingAudio,
}) => {
  return (
    <div className="practice-section">
      {/* Arabic Text Container */}
      <div dir="rtl" className="arabic-instruction">
        <p>مرحبا! كيف حالك؟ اضغط على الميكروفون واقرأ الجملة التالية:</p>
      </div>

      {/* English Sentence Container */}
      <div className="sentence-container" id="sentence">
        <p className="sentence-text">
          {currentSentence?.english || "Loading..."}
        </p>
      </div>

      {/* Arabic Translation */}
      <div className="translation-container" id="translationDiv">
        <p className="translation-text">
          {currentSentence?.arabic || "جاري التحميل..."}
        </p>
      </div>

      {/* Control Icons - Show when not recording and not processing */}
      {!showRecordingUI && !isProcessingAudio && (
        <div className="control-icons">
          {/* Listen Button - Shows pause icon when speaking */}
          <button
            className={`control-btn listen-btn ${
              isSpeaking && !isPaused ? "speaking" : ""
            } ${isPaused ? "paused" : ""}`}
            id="listenButton"
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

          {/* Microphone Button */}
          <button
            className={`mic-button ${isRecording ? "recording" : ""} ${
              isRecordingCancelled ? "cancelled" : ""
            }`}
            id="micButton"
            title={isRecording ? "Stop recording" : "Start recording"}
            onClick={onMicClick}
          >
            <i className="fas fa-microphone"></i>
          </button>

          {/* Play Recording Button - Shows pause icon when playing recorded audio */}
          <button
            className={`control-btn play-btn ${
              isPlayingRecording && !isRecordingPaused ? "speaking" : ""
            } ${isRecordingPaused ? "paused" : ""}`}
            id="bookmarkIcon"
            title={
              isPlayingRecording
                ? isRecordingPaused
                  ? "Resume recorded audio"
                  : "Pause recorded audio"
                : "Play recorded audio"
            }
            onClick={isPlayingRecording ? onPauseRecording : onPlayRecording}
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
      )}

      {/* Processing Spinner - Show when processing audio */}
      {!showRecordingUI && isProcessingAudio && (
        <div className="control-icons processing-state">
          {/* Listen Button - Disabled during processing */}
          <button
            className="control-btn listen-btn disabled"
            id="listenButton"
            title="Processing audio..."
            disabled
          >
            <i className="fas fa-volume-up"></i>
          </button>

          {/* Spinner in place of mic button */}
          <div className="spinner-container">
            <SpinnerLoadingIcon
              size={90}
              ariaLabel="Processing your recording, please wait..."
            />
          </div>

          {/* Play Recording Button - Disabled during processing */}
          <button
            className="control-btn play-btn disabled"
            id="bookmarkIcon"
            title="Processing audio..."
            disabled
          >
            <i className="fas fa-headphones"></i>
          </button>
        </div>
      )}

      {/* Recording UI Container - Show when recording */}
      {showRecordingUI && (
        <DesktopRecordingUI
          recordingTime={recordingTime}
          onStopRecording={onStopRecording}
          onDeleteRecording={onDeleteRecording}
          audioStream={audioStream}
        />
      )}
    </div>
  );
};

export default DesktopPracticeSection;
