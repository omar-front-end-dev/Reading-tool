import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import { useConversationProgress } from "../hooks/useConversationProgress";
import { useNewSpeechRecognition } from "../hooks/useNewSpeechRecognition";
import { usePronunciationScoring } from "../hooks/usePronunciationScoring";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import DesktopProgressSection from "../components/Pronunce/desktop/conversation/DesktopProgressSection";
import DesktopVideoSection from "../components/Pronunce/desktop/conversation/DesktopVideoSection";
import DesktopPracticeSection from "../components/Pronunce/desktop/conversation/DesktopPracticeSection";
import DesktopResultsDialog from "../components/Pronunce/desktop/conversation/DesktopResultsDialog";
import DesktopCompletionModal from "../components/Pronunce/desktop/conversation/DesktopCompletionModal";
import "./DesktopConversationPage.css";

export const DesktopConversationPage = () => {
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
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [isRecordingCancelled, setIsRecordingCancelled] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

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
    isPaused,
    isPlayingRecording,
    isRecordingPaused,
    recordedAudio,
    recordingTime,
    speechDetected,
    audioStream,
    startRecording,
    stopRecording,
    stopRecordingAndGetBlob,
    playRecordedAudio,
    pauseRecordedAudio,
    resumeRecordedAudio,
    togglePauseRecordedAudio,
    clearRecording,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    togglePauseSpeaking,
    ultraFastPause,
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

  // Set video source when conversation changes
  useEffect(() => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      if (currentSentence.videoSrc) {
        setVideoSource(currentSentence.videoSrc);
      }
    }
  }, [conversation, currentSentenceIndex, setVideoSource]);

  // Handle conversation completion
  const handleConversationCompleted = useCallback(
    (completedConversationId, finalScore) => {
      if (topic && lesson && lessonsData) {
        // Update topic progress
        const topicResult = updateTopicProgress(parseInt(topicId), topic);

        // If topic is completed, update lesson progress
        if (topicResult.completed) {
          const lessonResult = updateLessonProgressByTopics(
            parseInt(lessonNumber),
            lessonsData.lessons
          );
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

  // Show completion modal when conversation is completed
  useEffect(() => {
    if (
      isConversationCompleted &&
      currentSentenceIndex >= conversation?.sentences?.length - 1
    ) {
      setShowCompletionModal(true);

      // Trigger conversation completion handling
      if (conversation && topic && lesson) {
        handleConversationCompleted(conversation.id, overallScore);
      }
    } else {
      setShowCompletionModal(false);
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

  // Handle video end
  const handleVideoEnd = () => {
    // Video ended, ready for practice
  };

  // Handle listen button click
  const handleListenClick = () => {
    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      const currentSentence = conversation.sentences[currentSentenceIndex];
      speakText(currentSentence.english);
    }
  };

  // Handle microphone button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
      setShowRecordingUI(false);
    } else {
      startRecording();
      setShowRecordingUI(true);
      setIsRecordingCancelled(false); // Reset cancelled state when starting new recording
    }
  };

  // Handle stop recording
  const handleStopRecording = async () => {
    const audioBlob = await stopRecordingAndGetBlob();
    setShowRecordingUI(false);

    // Start processing state
    setIsProcessingAudio(true);

    // Play submission sound effect
    playSubmissionSound();

    if (audioBlob && conversation?.sentences?.[currentSentenceIndex]) {
      const currentSentence = conversation.sentences[currentSentenceIndex];

      try {
        const result = await calculatePronunciationScore(
          audioBlob,
          currentSentence.english
        );

        if (result) {
          setLastScore(result.score);
          setRecognizedText(result.recognizedText || "");
          setShowResultsDialog(true);
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        // Handle error case - you might want to show an error message
      } finally {
        // Always clear processing state
        setIsProcessingAudio(false);
      }
    } else {
      // Clear processing state if no audio or sentence
      setIsProcessingAudio(false);
    }
  };

  // Handle delete recording
  const handleDeleteRecording = () => {
    clearRecording();
    setShowRecordingUI(false);
    setIsRecordingCancelled(true);

    // Play custom cancellation sound effect
    playCancellationSound();
  };

  // Play custom cancellation sound - simple and reliable approach
  const playCancellationSound = () => {
    try {
      // Use Web Audio API for reliable sound generation
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "sine";

        // Create envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const currentTime = audioContext.currentTime;

      // Play two beeps for cancellation
      playTone(400, currentTime, 0.1); // First beep - higher pitch
      playTone(300, currentTime + 0.12, 0.1); // Second beep - lower pitch, slightly delayed
    } catch (error) {
      // Fallback: Use existing audio with different settings
      try {
        const audio1 = new Audio("/right-answer-sfx.wav");
        const audio2 = new Audio("/right-answer-sfx.wav");

        audio1.volume = 0.2;
        audio1.playbackRate = 1.2;
        audio1.play();

        // Play second beep after short delay
        setTimeout(() => {
          audio2.volume = 0.15;
          audio2.playbackRate = 0.8;
          audio2.play();
        }, 100);
      } catch (e) {
        // Last resort: just log
      }
    }
  };

  // Play custom submission sound - positive confirmation sound
  const playSubmissionSound = () => {
    try {
      // Use Web Audio API for reliable sound generation
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const playTone = (frequency, startTime, duration, volume = 0.2) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "sine";

        // Create envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const currentTime = audioContext.currentTime;

      // Play ascending chord for positive submission feedback
      playTone(523, currentTime, 0.15, 0.15); // C5 - first note
      playTone(659, currentTime + 0.05, 0.15, 0.15); // E5 - second note
      playTone(784, currentTime + 0.1, 0.2, 0.2); // G5 - final note (longer)
    } catch (error) {
      // Fallback: Use existing audio with different settings
      try {
        const audio = new Audio("/right-answer-sfx.wav");
        audio.volume = 0.25;
        audio.playbackRate = 1.0; // Normal speed for submission
        audio.play();
      } catch (e) {
        // Last resort: just log
      }
    }
  };

  // Handle retry
  const handleRetry = () => {
    setShowResultsDialog(false);
    clearRecording();
    setRecognizedText("");
    setIsProcessingAudio(false); // Ensure processing state is cleared
    retrySentence();
  };

  // Handle continue to next sentence
  const handleContinue = () => {
    setShowResultsDialog(false);
    clearRecording();
    setIsProcessingAudio(false); // Ensure processing state is cleared

    if (
      conversation &&
      conversation.sentences &&
      conversation.sentences[currentSentenceIndex]
    ) {
      completeSentence(currentSentenceIndex, lastScore);

      // Move to next sentence if not completed
      if (currentSentenceIndex < conversation.sentences.length - 1) {
        const nextSentenceIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextSentenceIndex);

        // Auto-play next video
        setTimeout(() => {
          if (conversation.sentences[nextSentenceIndex]?.videoSrc) {
            setVideoSource(conversation.sentences[nextSentenceIndex].videoSrc);
            setTimeout(() => {
              play();
            }, 200);
          }
        }, 500);
      }
    }
  };

  // Handle back to topics
  const handleBackToTopics = () => {
    navigate(`/topics/${lessonNumber}`);
  };

  // Handle close completion modal
  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    navigate(`/topics/${lessonNumber}`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className="desktop-conversation-page">
        <div className="main-container">
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading practice session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !topic || !conversation) {
    return (
      <div className="desktop-conversation-page">
        <div className="main-container">
          <div className="error-message">
            <h3>Content Not Found</h3>
            <p>
              {!lesson && `Lesson ${lessonNumber} not found. `}
              {!topic && `Topic ${topicId} not found. `}
              {!conversation && `Conversation ${conversationId} not found. `}
            </p>
            <button onClick={handleBackToTopics} className="btn btn-primary">
              Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSentence = conversation.sentences[currentSentenceIndex];

  return (
    <div className="desktop-conversation-page">
      <div className="main-container">
        <div className="content-wrapper">
          {/* Learning Progress Section */}
          <DesktopProgressSection
            currentSentenceIndex={currentSentenceIndex}
            totalSentences={conversation.sentences.length}
            progressPercentage={progressPercentage}
          />

          {/* Watch & Learn Section */}
          <DesktopVideoSection
            videoRef={videoRef}
            currentSentence={currentSentence}
            isPlaying={isPlaying}
            videoLoading={videoLoading}
            videoError={videoError}
            onPlay={play}
            onReplay={replay}
            onVideoEnd={handleVideoEnd}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onVideoPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          />

          {/* Practice Section */}
          <DesktopPracticeSection
            currentSentence={currentSentence}
            isRecording={isRecording}
            isSpeaking={isSpeaking}
            isPaused={isPaused}
            isPlayingRecording={isPlayingRecording}
            isRecordingPaused={isRecordingPaused}
            onListenClick={handleListenClick}
            onMicClick={handleMicClick}
            onPlayRecording={playRecordedAudio}
            onPauseClick={ultraFastPause}
            onPauseRecording={togglePauseRecordedAudio}
            showRecordingUI={showRecordingUI}
            recordingTime={recordingTime}
            onStopRecording={handleStopRecording}
            onDeleteRecording={handleDeleteRecording}
            isRecordingCancelled={isRecordingCancelled}
            audioStream={audioStream}
            isProcessingAudio={isProcessingAudio}
          />
        </div>
      </div>

      {/* Results Dialog */}
      {showResultsDialog && (
        <DesktopResultsDialog
          show={showResultsDialog}
          score={lastScore}
          recognizedText={recognizedText}
          targetText={currentSentence?.english}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          isPlayingRecording={isPlayingRecording}
          isRecordingPaused={isRecordingPaused}
          onRetry={handleRetry}
          onContinue={handleContinue}
          onClose={() => setShowResultsDialog(false)}
          onListenClick={handleListenClick}
          onPlayRecording={playRecordedAudio}
          onPauseClick={ultraFastPause}
          onPauseRecording={togglePauseRecordedAudio}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <DesktopCompletionModal
          show={showCompletionModal}
          overallScore={overallScore}
          onClose={handleCloseCompletionModal}
        />
      )}
    </div>
  );
};
