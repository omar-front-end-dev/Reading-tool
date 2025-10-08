import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useMobileFeatures } from "../hooks/useMobileFeatures";
import useSubtitleSync from "../hooks/useSubtitleSync";
import MobileProgressBar from "../components/Pronunce/mobile/MobileProgressBar";
import MobileBackButton from "../components/Pronunce/mobile/MobileBackButton";
import MobileSubtitleContainer from "../components/Pronunce/mobile/MobileSubtitleContainer";
import MobileReplayOverlay from "../components/Pronunce/mobile/MobileReplayOverlay";
import MobilePracticeOverlay from "../components/Pronunce/mobile/MobilePracticeOverlay";
import MobileCompletionCard from "../components/Pronunce/mobile/MobileCompletionCard";
import MobileResultsDialog from "../components/Pronunce/mobile/MobileResultsDialog";
import MobileAlertContainer from "../components/Pronunce/mobile/MobileAlertContainer";
import "./MobileLessonPage.css";

export const MobileLessonPage = () => {
  const { lessonNumber, topicId, conversationId } = useParams();
  const navigate = useNavigate();
  const {
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
    updateTopicProgress,
    updateLessonProgressByTopics,
  } = useProgress();

  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [lessonsData, setLessonsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPracticeOverlay, setShowPracticeOverlay] = useState(false);
  const [showReplayOverlay, setShowReplayOverlay] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [topicCompletedStatus, setTopicCompletedStatus] = useState(false);
  const [lessonCompletedStatus, setLessonCompletedStatus] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showIOSAudioOverlay, setShowIOSAudioOverlay] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [missingWords, setMissingWords] = useState([]);
  const [lastScore, setLastScore] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [pendingVideoPlay, setPendingVideoPlay] = useState(false);
  const [videoLoadAttempts, setVideoLoadAttempts] = useState(0);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);

  // Add ref for managing user interaction
  const userInteractionRef = useRef(false);

  // Hooks
  const {
    currentSentenceIndex,
    sentenceScores,
    completedSentences,
    overallScore,
    progressPercentage,
    isConversationCompleted,
    isCurrentSentenceCompleted,
    completeSentence,
    retrySentence,
    resetConversation,
    setCurrentSentenceIndex,
  } = useConversationProgress(
    conversationId ? parseInt(conversationId) : 0,
    conversation?.sentences?.length || 0
  );

  const {
    isRecording,
    isSpeaking,
    recordedAudio,
    recordingTime,
    speechDetected,
    audioStream, // Add audioStream like desktop
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    playRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    cleanup,
  } = useNewSpeechRecognition();

  const {
    isProcessing,
    calculatePronunciationScore,
    getScoreColor,
    getScoreMessage,
  } = usePronunciationScoring();

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading: videoLoading,
    hasError: videoError,
    play,
    pause,
    replay,
    setVideoSource,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
    getProgress,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  } = useVideoPlayer();

  const {
    isMobile,
    viewportHeight,
    setupMobileAccessibility,
    enableVideoAudio,
    mobileSpeakSentence,
    playMobileRecordedAudioSlow,
    showMobileAlert,
    hideMobileAlert,
  } = useMobileFeatures();

  // Subtitle synchronization hook
  const {
    currentSubtitle,
    subtitles,
    isSubtitlesActive,
    isLoading: subtitleLoading,
    error: subtitleError,
    loadSubtitlesForSentence,
    clearSubtitles,
  } = useSubtitleSync(videoRef);

  // Enhanced video play function with user interaction check
  const safeVideoPlay = async () => {
    if (!videoRef.current) {
      console.error("Video ref is null");
      return false;
    }

    try {
      await videoRef.current.play();
      return true;
    } catch (error) {
      console.error("Video play failed:", error.name, error.message);
      if (error.name === "NotAllowedError") {
        setShowIOSAudioOverlay(true);
        setPendingVideoPlay(true);
        return false;
      } else if (error.name === "NotSupportedError") {
        console.error("Video format not supported or video failed to load");
        return false;
      } else {
        console.error("Other video play error:", error);
        return false;
      }
    }
  };

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        const response = await fetch("/assets/data.json");
        const data = await response.json();
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      }
    };

    loadLessonsData();
  }, []);

  // Load conversation data
  useEffect(() => {
    if (!lessonsData) return;

    const currentLesson = lessonsData.lessons.find(
      (l) => l.lessonNumber === parseInt(lessonNumber)
    );

    if (currentLesson) {
      setLesson(currentLesson);
      setCurrentLesson(currentLesson.lessonNumber);

      const currentTopic = currentLesson.topics.find(
        (t) => t.id === parseInt(topicId)
      );

      if (currentTopic) {
        setTopic(currentTopic);
        setCurrentTopic(currentTopic.id);

        const currentConversation = currentTopic.conversations.find(
          (c) => c.id === parseInt(conversationId)
        );

        if (currentConversation) {
          setConversation(currentConversation);
          setCurrentConversation(currentConversation.id);
        } else {
          console.error("Conversation not found with ID:", conversationId);
        }
      } else {
        console.error("Topic not found with ID:", topicId);
      }
    } else {
      console.error("Lesson not found with number:", lessonNumber);
    }
    setIsLoading(false);
  }, [
    lessonNumber,
    topicId,
    conversationId,
    lessonsData,
    setCurrentLesson,
    setCurrentTopic,
    setCurrentConversation,
  ]);

  // Retry video loading function
  const retryVideoLoad = useCallback(
    (videoSrc, attempts = 0) => {
      const maxAttempts = 3;
      if (attempts >= maxAttempts) {
        console.error(
          `Failed to load video after ${maxAttempts} attempts:`,
          videoSrc
        );
        return;
      }

      setVideoLoadAttempts(attempts + 1);
      setVideoSource(videoSrc);

      // Set a timeout to retry if video doesn't load
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState < 3) {
          retryVideoLoad(videoSrc, attempts + 1);
        }
      }, 3000);
    },
    [setVideoSource]
  );

  // Set video source when conversation changes
  useEffect(() => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (
        currentSentence.videoSrc &&
        currentSentence.videoSrc !== currentVideoSrc
      ) {
        setCurrentVideoSrc(currentSentence.videoSrc);
        setVideoLoadAttempts(0);
        retryVideoLoad(currentSentence.videoSrc);

        // Load subtitles for current sentence (mobile only)
        if (isMobile) {
          loadSubtitlesForSentence(
            parseInt(lessonNumber),
            parseInt(topicId),
            parseInt(conversationId),
            currentSentenceIndex + 1 // SRT files are 1-based
          );
        }

        // Wait for video to load before attempting to play
        const handleCanPlayThrough = () => {
          if (hasUserInteracted || userInteractionRef.current) {
            setTimeout(() => {
              safeVideoPlay();
            }, 100);
          } else {
            // Show interaction overlay for first video
            setShowIOSAudioOverlay(true);
          }
          videoRef.current?.removeEventListener(
            "canplaythrough",
            handleCanPlayThrough
          );
        };

        if (videoRef.current) {
          videoRef.current.addEventListener(
            "canplaythrough",
            handleCanPlayThrough
          );
        }
      } else {
      }
    }
  }, [
    conversation,
    currentSentenceIndex,
    currentVideoSrc,
    hasUserInteracted,
    retryVideoLoad,
    isMobile,
    lessonNumber,
    topicId,
    conversationId,
    loadSubtitlesForSentence,
  ]);

  // Handle conversation completion and update topic/lesson progress
  const handleConversationCompleted = useCallback(
    (completedConversationId, finalScore) => {
      if (topic && lesson && lessonsData) {
        // Update topic progress based on all conversations in the topic
        const topicResult = updateTopicProgress(parseInt(topicId), topic);

        // If topic is completed, update lesson progress
        if (topicResult.completed) {
          setTopicCompletedStatus(true);

          const lessonResult = updateLessonProgressByTopics(
            parseInt(lessonNumber),
            lessonsData.lessons
          );

          if (lessonResult.completed) {
            setLessonCompletedStatus(true);
          }
        }
      }
    },
    [
      topic,
      lesson,
      lessonsData,
      topicId,
      lessonNumber,
      updateTopicProgress,
      updateLessonProgressByTopics,
    ]
  );

  // Set up global conversation completion callback
  useEffect(() => {
    window.onConversationCompleted = handleConversationCompleted;
    return () => {
      window.onConversationCompleted = null;
    };
  }, [handleConversationCompleted]);

  // Show completion card only when conversation is actually completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= conversation?.sentences?.length - 1
    ) {
      setShowCompletionCard(true);

      // Trigger conversation completion handling
      if (conversation && topic && lesson) {
        handleConversationCompleted(conversation.id, overallScore);
      }
    } else {
      setShowCompletionCard(false);
    }
  }, [
    isConversationCompleted,
    currentSentenceIndex,
    conversation,
    topic,
    lesson,
    overallScore,
    handleConversationCompleted,
  ]);

  // Detect if we're on mobile and set initial overlay state
  useEffect(() => {
    if (isMobile) {
      // On mobile, always show the overlay initially
      setShowIOSAudioOverlay(true);
      setHasUserInteracted(false);
    } else {
      // On desktop, user interaction might not be required
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }
  }, [isMobile]);

  const handleBackClick = () => {
    navigate(`/pronounce/topics/${lessonNumber}`);
  };

  const handleVideoEnd = () => {
    setShowReplayOverlay(true);
    // Show practice overlay immediately (no delay)
    setShowPracticeOverlay(true);
  };

  const handleReplayClick = async () => {
    setShowReplayOverlay(false);
    setShowPracticeOverlay(false); // Hide practice overlay when replaying
    // Ensure user has interacted before replaying
    if (hasUserInteracted || userInteractionRef.current) {
      // Reset video to beginning and play
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        await safeVideoPlay();
      }
    } else {
      setShowIOSAudioOverlay(true);
    }
  };

  const handlePracticeClose = () => {
    setShowPracticeOverlay(false);
  };

  const handleListenClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english);
      } else {
        speakText(currentSentence.english);
      }
    }
  };

  const handleListenSlowClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (isMobile) {
        mobileSpeakSentence(currentSentence.english, true);
      } else {
        speakText(currentSentence.english, 0.7, 1);
      }
    }
  };

  const handleMicClick = () => {
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStopRecording = async () => {
    // Just stop the recording - let MobilePracticeOverlay handle the processing
    await stopRecordingAndGetBlob();
  };

  const handleRetry = () => {
    setShowResultsDialog(false);
    clearRecording();
    setRecognizedText("");
    setMissingWords([]);
    // Reset practice overlay states
    setShowPracticeOverlay(false);
    setShowReplayOverlay(false);
    // Reset the sentence for retry
    retrySentence();
    // Show practice overlay after a short delay
    setTimeout(() => {
      setShowPracticeOverlay(true);
    }, 500);
  };

  const handleContinue = async () => {
    setShowResultsDialog(false);
    clearRecording();

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      if (currentSentenceIndex < conversation.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextSentenceIndex);

        // Hide practice overlay and replay overlay
        setShowPracticeOverlay(false);
        setShowReplayOverlay(false);

        // Load subtitles for next sentence (mobile only)
        if (isMobile) {
          loadSubtitlesForSentence(
            parseInt(lessonNumber),
            parseInt(topicId),
            parseInt(conversationId),
            nextSentenceIndex + 1 // SRT files are 1-based
          );
        }

        // Auto-play next video (only if user has interacted)
        if (hasUserInteracted || userInteractionRef.current) {
          setTimeout(async () => {
            if (conversation.sentences[nextSentenceIndex]?.videoSrc) {
              setVideoSource(
                conversation.sentences[nextSentenceIndex].videoSrc
              );
              // Wait a bit for video source to load, then play
              setTimeout(() => {
                safeVideoPlay();
              }, 200);
            }
          }, 500);
        }
      }
    }
  };

  const handleBackToLessons = () => {
    // Save progress before navigating back
    if (lesson && topic && conversation) {
      // Progress is already saved through the ProgressContext
    }
    navigate(`/pronounce/topics/${lessonNumber}`);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const handleIOSAudioClick = async () => {
    // Mark that user has interacted
    setHasUserInteracted(true);
    userInteractionRef.current = true;

    // Enable video audio
    enableVideoAudio();

    // Hide the overlay
    setShowIOSAudioOverlay(false);

    // Unmute and try to play video
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;

      // If there was a pending video play, try now
      if (pendingVideoPlay) {
        setPendingVideoPlay(false);
        await safeVideoPlay();
      }
    }
  };

  const handleDeleteRecording = () => {
    // Actually stop the recording to reset isRecording state
    if (isRecording) {
      stopRecording();
    }
    clearRecording();
    // Keep practice overlay visible (like desktop) - just reset to initial state
    // The MobilePracticeOverlay will handle showing the initial controls
  };

  const handlePracticeComplete = (results) => {
    // Handle results from MobilePracticeOverlay
    setLastScore(results.score);
    setRecognizedText(results.recognizedText);
    setMissingWords([]); // MobilePracticeOverlay doesn't calculate missing words
    setShowResultsDialog(true);
    // Keep practice overlay visible so results dialog can show
  };

  const handleVideoClick = async () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      userInteractionRef.current = true;

      if (isMobile) {
        enableVideoAudio();
        setShowIOSAudioOverlay(false);

        // Unmute video on user interaction
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
        }
      }
    }

    // Try to play/pause video
    if (videoRef.current) {
      if (videoRef.current.paused) {
        await safeVideoPlay();
      } else {
        pause();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <div className="spinner"></div>
          <span>Loading practice session...</span>
        </div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="mobile-video-container">
        <div className="mobile-loading show">
          <span>
            {!lesson && `Lesson ${lessonNumber} not found. `}
            {!topic && `Topic ${topicId} not found. `}
            {!conversation && `Conversation ${conversationId} not found. `}
            <br />
            URL: /mobile/{lessonNumber}/{topicId}/{conversationId}
            <br />
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "var(--sna-primary)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
          </span>
        </div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <>
      <div className="mobile-video-container">
        {/* Mobile Progress Bar */}
        <MobileProgressBar
          totalSentences={conversation.sentences.length}
          currentSentenceIndex={currentSentenceIndex}
          completedSentences={completedSentences}
        />

        {/* Back Button */}
        <MobileBackButton onBackClick={handleBackClick} />

        {/* Video Element */}
        <div className="video-container-wrapper">
          <video
            ref={videoRef}
            className="mobile-lesson-video"
            playsInline
            preload="metadata"
            muted={!hasUserInteracted}
            webkit-playsinline="true"
            crossOrigin="anonymous"
            onClick={handleVideoClick}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleVideoEnd}
            onError={(e) => {
              console.error("Video error event:", e.target.error);
              if (e.target.error) {
                console.error("Error code:", e.target.error.code);
                console.error("Error message:", e.target.error.message);
              }
              handleError(e);
            }}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
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

        {/* iOS Audio Enable Overlay */}
        {showIOSAudioOverlay && (
          <div className="ios-audio-overlay" onClick={handleIOSAudioClick}>
            <div className="ios-audio-content">
              <i className="fas fa-volume-up"></i>
              <p>Tap to enable audio and start</p>
            </div>
          </div>
        )}

        {/* Subtitle Container */}
        <MobileSubtitleContainer
          englishText={currentSentence?.english}
          arabicText={currentSentence?.arabic}
          currentSubtitle={currentSubtitle}
          showVideoSubtitles={true}
          isMobile={isMobile}
        />

        {/* Replay Overlay */}
        <MobileReplayOverlay
          show={showReplayOverlay}
          onReplayClick={handleReplayClick}
        />

        {/* Practice Overlay */}
        <MobilePracticeOverlay
          show={showPracticeOverlay}
          sentence={currentSentence}
          isRecording={isRecording}
          recordingTime={recordingTime}
          speechDetected={speechDetected}
          isProcessing={isProcessing}
          audioStream={audioStream}
          pronunciationScore={
            lastScore
              ? {
                  score: lastScore,
                  transcriptWords: recognizedText.split(" "),
                  matchedTranscriptIndices: [],
                  missingWords: missingWords,
                }
              : null
          }
          transcription={recognizedText}
          onClose={handlePracticeClose}
          onComplete={handlePracticeComplete}
          onListenClick={handleListenClick}
          onListenSlowClick={handleListenSlowClick}
          onMicClick={handleMicClick}
          onStopRecording={handleStopRecording}
          onPlayRecording={playRecordedAudio}
          onDeleteRecording={handleDeleteRecording}
          onShowAlert={showAlertMessage}
        />

        {/* Completion Card */}
        <MobileCompletionCard
          show={showCompletionCard}
          overallScore={overallScore}
          onBackToLessons={handleBackToLessons}
          topicCompleted={topicCompletedStatus}
          lessonCompleted={lessonCompletedStatus}
        />

        {/* Alert Container */}
        <MobileAlertContainer
          show={showAlert}
          message={alertMessage}
          onClose={hideAlert}
        />
      </div>

      {/* Mobile Results Dialog - Outside mobile-video-container */}
      {showResultsDialog && (
        <MobileResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          missingWords={missingWords}
          isProcessing={isProcessing}
          targetText={conversation?.sentences?.[currentSentenceIndex]?.english}
          recordedBlob={recordedAudio}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={() => setShowResultsDialog(false)}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
        />
      )}
    </>
  );
};


