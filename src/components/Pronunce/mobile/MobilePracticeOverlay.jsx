import React, { useState, useEffect, useRef, useCallback } from "react";

const MobilePracticeOverlay = ({
  show = false,
  sentence = {
    english: "Can I see the menu?",
    phonetic: "kÃ¦n aÉª siË Ã°É™ mÉ›njuË",
  },
  onClose = () => {},
  onComplete = () => {},
  onMicClick = () => {},
  onStopRecording = () => {},
  onListenClick = () => {},
  onListenSlowClick = () => {},
  onPlayRecording = () => {},
  onDeleteRecording = () => {},
  onShowAlert = () => {}, // New prop to communicate with parent for showing alerts
  audioStream = null, // Add audio stream prop like desktop
  isRecording = false,
  recordingTime = 0,
  speechDetected = false,
  isProcessing = false,
  pronunciationScore = null,
  transcription = "",
}) => {
  // State management (only internal UI state)
  const [waveformBars, setWaveformBars] = useState(
    Array.from({ length: 26 }, () => 6)
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Track if speech synthesis is paused
  const [isPlayingRecording, setIsPlayingRecording] = useState(false); // Track if recorded audio is playing
  const [isRecordingPaused, setIsRecordingPaused] = useState(false); // Track if recorded audio playback is paused
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [hasUserRecording, setHasUserRecording] = useState(false); // Track if user has recorded for this sentence
  const [showRecordingAlert, setShowRecordingAlert] = useState(false); // Track if we should show the recording alert
  const [isProcessingLocal, setIsProcessingLocal] = useState(false); // Local processing state
  const [isRecordingCancelled, setIsRecordingCancelled] = useState(false); // Visual state for cancelled recording

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const waveformAnimationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null); // Add dataArray ref like desktop
  const sourceRef = useRef(null); // Add source ref like desktop
  const isRecordingCancelledRef = useRef(false); // Use ref to track cancellation
  const currentUtteranceRef = useRef(null); // Track current speech synthesis utterance
  const currentAudioRef = useRef(null); // Track current recorded audio playback
  // audioStream is now passed as prop from parent

  // AssemblyAI API Key - You can set this as an environment variable
  // For development, you can replace this with your actual API key
  const ASSEMBLYAI_API_KEY =
    import.meta.env.VITE_ASSEMBLYAI_API_KEY ||
    "bdb00961a07c4184889a80206c52b6f2";

  // Check if API key is valid (AssemblyAI keys are typically longer)
  const isApiKeyValid = ASSEMBLYAI_API_KEY && ASSEMBLYAI_API_KEY.length > 20;

  // Sound effects functions
  const playCancellationSound = useCallback(() => {
    try {
      // Use Web Audio API for reliable sound generation
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create a sequence of descending tones for cancellation
      const frequencies = [800, 600, 400];
      const duration = 0.15;

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startTime = audioContext.currentTime + index * duration;

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
      });
    } catch (error) {
      // Fallback: Use existing audio with different settings
      try {
        const audio1 = new Audio("/assets/audio/right answer SFX.wav");
        const audio2 = new Audio("/assets/audio/right answer SFX.wav");

        audio1.volume = 0.2;
        audio1.playbackRate = 1.2;
        audio1.play();

        setTimeout(() => {
          audio2.volume = 0.15;
          audio2.playbackRate = 0.8;
          audio2.play();
        }, 100);
      } catch (fallbackError) {}
    }
  }, []);

  const playSubmissionSound = useCallback(() => {
    try {
      // Use Web Audio API for reliable sound generation
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create an ascending tone sequence for submission
      const frequencies = [400, 600, 800];
      const duration = 0.12;

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startTime = audioContext.currentTime + index * duration;
        const volume = 0.15 - index * 0.03; // Slightly decreasing volume

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
      });
    } catch (error) {
      // Fallback: Use existing audio with different settings
      try {
        const audio = new Audio("/right-answer-sfx.wav");
        audio.volume = 0.25;
        audio.playbackRate = 1.0; // Normal speed for submission
        audio.play();
      } catch (fallbackError) {}
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (waveformAnimationRef.current) {
      cancelAnimationFrame(waveformAnimationRef.current);
      waveformAnimationRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Audio stream cleanup is handled by parent component
    setWaveformBars(Array.from({ length: 26 }, () => 6));
  }, []);

  // Speech synthesis for listening with pause/resume support
  const handleListen = useCallback(
    (slow = false) => {
      if (isRecording) return;

      // Handle pause/resume for already speaking utterance
      if (isSpeaking) {
        if (isPaused) {
          // Resume speech
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          // Pause speech
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
        return;
      }

      // Start new speech
      window.speechSynthesis.cancel(); // Cancel any existing speech
      const utterance = new SpeechSynthesisUtterance(sentence.english);
      utterance.lang = "en-US";
      utterance.rate = slow ? 0.6 : 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [sentence.english, isRecording, isSpeaking, isPaused]
  );

  // Play recorded audio with pause/resume support and alert for no recording
  const handlePlayRecorded = useCallback(() => {
    if (isRecording) return;

    // Check if user has no recording - show alert
    if (!hasUserRecording || !recordedBlob) {
      onShowAlert(
        "Please record your voice first by clicking the microphone button, then you can listen to your recording."
      );
      return;
    }

    // Handle pause/resume for already playing audio
    if (isPlayingRecording && currentAudioRef.current) {
      if (isRecordingPaused) {
        // Resume playback
        currentAudioRef.current.play().catch(console.error);
        setIsRecordingPaused(false);
      } else {
        // Pause playback
        currentAudioRef.current.pause();
        setIsRecordingPaused(true);
      }
      return;
    }

    // Start new playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(URL.createObjectURL(recordedBlob));
    audio.playbackRate = 0.7; // Slow playback

    audio.onplay = () => {
      setIsPlayingRecording(true);
      setIsRecordingPaused(false);
    };
    audio.onpause = () => {
      setIsRecordingPaused(true);
    };
    audio.onended = () => {
      setIsPlayingRecording(false);
      setIsRecordingPaused(false);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingRecording(false);
      setIsRecordingPaused(false);
      currentAudioRef.current = null;
    };

    currentAudioRef.current = audio;
    audio.play().catch(console.error);
  }, [
    recordedBlob,
    isRecording,
    isPlayingRecording,
    isRecordingPaused,
    hasUserRecording,
    onShowAlert,
  ]);

  // Real-time audio analysis - EXACTLY like desktop
  useEffect(() => {
    if (!audioStream) return;

    const setupAudioAnalysis = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // EXACTLY like desktop
        analyserRef.current.smoothingTimeConstant = 0.8; // EXACTLY like desktop

        // Create data array for frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Connect audio stream to analyser
        sourceRef.current =
          audioContextRef.current.createMediaStreamSource(audioStream);
        sourceRef.current.connect(analyserRef.current);

        // Start real-time analysis
        const analyzeAudio = () => {
          try {
            if (analyserRef.current && dataArrayRef.current) {
              analyserRef.current.getByteFrequencyData(dataArrayRef.current);

              // Convert frequency data to bar heights - EXACTLY like desktop
              const barCount = 26; // Mobile has more bars
              const dataPerBar = Math.floor(
                dataArrayRef.current.length / barCount
              );
              const newBars = [];

              for (let i = 0; i < barCount; i++) {
                let sum = 0;
                for (let j = 0; j < dataPerBar; j++) {
                  sum += dataArrayRef.current[i * dataPerBar + j];
                }
                const average = sum / dataPerBar;
                // Convert to height (0-255 range to 2-22px range) - EXACTLY like desktop calculation
                const height = Math.max(2, (average / 255) * 20 + 2);
                newBars.push(height);
              }

              setWaveformBars(newBars);
              waveformAnimationRef.current =
                requestAnimationFrame(analyzeAudio);
            }
          } catch (animationError) {
            // Continue with fallback animation
            setWaveformBars((prev) => prev.map(() => Math.random() * 20 + 2));
            waveformAnimationRef.current = requestAnimationFrame(analyzeAudio);
          }
        };

        analyzeAudio();
      } catch (error) {
        console.error("Error setting up audio analysis:", error);
        // Fallback to random animation if audio analysis fails - EXACTLY like desktop
        const animateWaveform = () => {
          setWaveformBars((prev) => prev.map(() => Math.random() * 20 + 2));
          waveformAnimationRef.current = requestAnimationFrame(animateWaveform);
        };
        animateWaveform();
      }
    };

    setupAudioAnalysis().catch((error) => {
      console.error("Setup audio analysis failed:", error);
    });

    return () => {
      try {
        if (waveformAnimationRef.current) {
          cancelAnimationFrame(waveformAnimationRef.current);
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      } catch (cleanupError) {}
    };
  }, [audioStream]); // EXACTLY like desktop - depend on audioStream prop

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      cleanup();

      // Reset cancellation flags
      isRecordingCancelledRef.current = false;
      setIsRecordingCancelled(false);

      // Notify parent that recording is starting
      onMicClick();

      // Request microphone permission with iOS compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Audio stream is now passed as prop from parent

      // Setup MediaRecorder with iOS compatibility
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback for iOS Safari
        mimeType = "audio/mp4";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/wav";
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Don't process if recording was cancelled
        if (isRecordingCancelledRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          // Reset the cancellation flag for next recording
          isRecordingCancelledRef.current = false;
          return;
        }

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process the recording
        await processRecording(blob);
      };

      // Start recording
      mediaRecorderRef.current.start(100);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error("Recording failed:", error);
      alert(
        "Could not access microphone. Please check permissions and try again."
      );
      cleanup();
    }
  }, [cleanup, onMicClick]);

  // Stop recording with submission sound
  const stopRecording = useCallback(() => {
    // Play submission sound effect
    playSubmissionSound();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    // Notify parent that recording is stopping
    onStopRecording();
  }, [cleanup, onStopRecording, playSubmissionSound]);

  // Cancel recording with sound effect - desktop behavior
  const cancelRecording = useCallback(() => {
    // Play cancellation sound effect
    playCancellationSound();

    // Set cancellation flag BEFORE stopping the recorder
    isRecordingCancelledRef.current = true;

    // Set visual cancelled state (like desktop)
    setIsRecordingCancelled(true);

    // Stop the MediaRecorder if it's recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Reset recording state
    setRecordedBlob(null);
    cleanup();

    // Notify parent that recording was cancelled (but don't hide overlay)
    onDeleteRecording();
  }, [cleanup, onDeleteRecording, playCancellationSound]);

  // Calculate pronunciation score
  const calculatePronunciationScore = useCallback((recognized, expected) => {
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

    const recognizedWords = normalizeText(recognized).split(/\s+/);
    const expectedWords = normalizeText(expected).split(/\s+/);

    if (recognizedWords.length === 0 || expectedWords.length === 0) return 0;

    let matches = 0;
    expectedWords.forEach((expectedWord) => {
      if (recognizedWords.includes(expectedWord)) {
        matches++;
      }
    });

    return Math.round((matches / expectedWords.length) * 100);
  }, []);

  // Process recording with AssemblyAI or fallback
  const processRecording = useCallback(
    async (blob) => {
      if (!blob || blob.size < 1000) {
        alert("Recording too short. Please try again.");
        return;
      }

      // Set local processing state
      setIsProcessingLocal(true);

      // If API key is invalid, use fallback processing
      if (!isApiKeyValid) {
        const fallbackScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100
        // Mark that user has successfully recorded for this sentence
        setHasUserRecording(true);
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english, // Use target text as fallback
          targetText: sentence.english,
          recordedBlob: blob,
        });
        setIsProcessingLocal(false);
        return;
      }

      try {
        // Upload to AssemblyAI
        const uploadResponse = await fetch(
          "https://api.assemblyai.com/v2/upload",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/octet-stream",
            },
            body: blob,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("AssemblyAI upload error:", errorText);
          throw new Error(
            `Upload failed: ${uploadResponse.status} ${errorText}`
          );
        }

        const uploadData = await uploadResponse.json();

        // Show immediate feedback that upload is complete and processing has started

        // Request transcription
        const transcriptionResponse = await fetch(
          "https://api.assemblyai.com/v2/transcript",
          {
            method: "POST",
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              audio_url: uploadData.upload_url,
              language_code: "en",
            }),
          }
        );

        if (!transcriptionResponse.ok) {
          const errorText = await transcriptionResponse.text();
          console.error("AssemblyAI transcription error:", errorText);
          throw new Error(
            `Transcription request failed: ${transcriptionResponse.status} ${errorText}`
          );
        }

        const transcriptionData = await transcriptionResponse.json();

        // Poll for completion
        let result;
        let attempts = 0;
        const maxAttempts = 15; // Reduced from 30 to 15 seconds timeout

        while (attempts < maxAttempts) {
          const statusResponse = await fetch(
            `https://api.assemblyai.com/v2/transcript/${transcriptionData.id}`,
            {
              headers: { authorization: ASSEMBLYAI_API_KEY },
            }
          );

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          result = await statusResponse.json();

          if (result.status === "completed") {
            break;
          } else if (result.status === "error") {
            throw new Error("Transcription failed");
          }

          await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms
          attempts++;
        }

        if (attempts >= maxAttempts) {
          throw new Error("Transcription timeout");
        }

        // Calculate score and show results dialog
        const score = calculatePronunciationScore(
          result.text,
          sentence.english
        );

        // Processing complete
        setIsProcessingLocal(false);
        // Mark that user has successfully recorded for this sentence
        setHasUserRecording(true);
        // Call onComplete to let parent handle results
        onComplete({
          score: score,
          recognizedText: result.text,
          targetText: sentence.english,
          recordedBlob: blob,
        });
      } catch (error) {
        console.error("Processing error:", error);
        setIsProcessingLocal(false);

        // Use fallback processing on error
        const fallbackScore = Math.floor(Math.random() * 30) + 50; // Random score 50-80
        // Mark that user has successfully recorded for this sentence
        setHasUserRecording(true);
        onComplete({
          score: fallbackScore,
          recognizedText: sentence.english, // Use target text as fallback
          targetText: sentence.english,
          recordedBlob: blob,
        });
      }
    },
    [sentence.english, onComplete, isApiKeyValid, calculatePronunciationScore]
  );

  // Format recording time
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Reset state when show changes
  // Reset cancelled state when parent's recording state changes
  useEffect(() => {
    if (!isRecording && isRecordingCancelled) {
      // Reset cancelled state after animation completes
      setTimeout(() => {
        setIsRecordingCancelled(false);
      }, 600); // Match desktop animation duration
    }
  }, [isRecording, isRecordingCancelled]);

  useEffect(() => {
    if (!show) {
      cleanup();
      // State is managed by parent
      setRecordedBlob(null);

      // Clean up speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;

      // Clean up audio playback
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsPlayingRecording(false);
      setIsRecordingPaused(false);
    }
  }, [show, cleanup]);

  // Reset recording status when sentence changes
  useEffect(() => {
    setHasUserRecording(false);
    setRecordedBlob(null);
    setIsPlayingRecording(false);
    setIsRecordingPaused(false);

    // Clean up audio playback when sentence changes
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, [sentence.english]); // Reset when sentence changes

  return (
    <>
      <div className={`mobile-practice-overlay ${show ? "show" : ""}`}>
        <div className="practice-card">
          {/* Close Button */}
          <button className="practice-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>

          {/* Header */}
          <div className="practice-header">
            <h3>Your turn!</h3>
            <p>
              Press the <i className="fas fa-microphone"></i> and record your
              voice.
            </p>
          </div>

          {/* Sentence - Always Visible */}
          <div className="practice-sentence">
            <div className="sentence-text">{sentence.english}</div>
            <div className="sentence-phonetic">{sentence.phonetic}</div>
          </div>

          {/* Normal State - Practice Controls */}
          {(!isRecording || isRecordingCancelled) && !isProcessingLocal && (
            <div className="practice-controls">
              <button
                className={`control-btn listen-btn ${
                  isSpeaking && !isPaused ? "speaking" : ""
                } ${isPaused ? "paused" : ""}`}
                onClick={() => handleListen(false)}
                title={
                  isSpeaking
                    ? isPaused
                      ? "Resume listening"
                      : "Pause listening"
                    : "Listen to example"
                }
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

              <button
                className={`mic-btn ${isRecordingCancelled ? "cancelled" : ""}`}
                onClick={startRecording}
              >
                <i className="fas fa-microphone"></i>
              </button>

              <button
                className={`control-btn listen-slow-btn ${
                  isPlayingRecording && !isRecordingPaused ? "speaking" : ""
                } ${isRecordingPaused ? "paused" : ""}`}
                onClick={handlePlayRecorded}
                title={
                  isPlayingRecording
                    ? isRecordingPaused
                      ? "Resume recorded audio"
                      : "Pause recorded audio"
                    : "Play recorded audio"
                }
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

          {/* Recording State - Enhanced Waveform replaces controls */}
          {isRecording && !isRecordingCancelled && !isProcessingLocal && (
            <div className="mobile-waveform-container">
              <button
                className="mobile-pause-btn"
                onClick={cancelRecording}
                title="Delete recording"
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>

              <div className="mobile-waveform-area">
                <div className="mobile-waveform-bars">
                  {waveformBars.map((height, index) => (
                    <div
                      key={index}
                      className={`mobile-waveform-bar ${
                        height > 12 ? "active" : ""
                      }`}
                      style={{
                        height: `${height}px`,
                        transition: "height 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                        animationDelay: `${index * 0.02}s`,
                      }}
                    ></div>
                  ))}
                </div>

                <div className="mobile-recording-timer">
                  <i className="fas fa-circle recording-indicator"></i>
                  {formatTime(recordingTime)}
                </div>
              </div>

              <button
                className="mobile-send-btn"
                onClick={stopRecording}
                title="Stop recording"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          )}

          {/* Processing State - Disabled controls with spinner */}
          {isProcessingLocal && (
            <div className="practice-controls">
              <button
                className="control-btn listen-btn disabled"
                title="Processing audio..."
                disabled
              >
                <i className="fas fa-volume-up"></i>
              </button>

              <button className="mic-btn processing" disabled>
                <div className="processing-spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              <button
                className="control-btn listen-slow-btn disabled"
                title="Processing audio..."
                disabled
              >
                <i className="fas fa-headphones"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobilePracticeOverlay;
