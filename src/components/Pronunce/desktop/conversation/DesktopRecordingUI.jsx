import React, { useState, useEffect, useRef } from "react";

const DesktopRecordingUI = ({
  recordingTime,
  onStopRecording,
  onDeleteRecording,
  audioStream, // Add audio stream prop
}) => {
  const [waveformBars, setWaveformBars] = useState(
    Array.from({ length: 14 }, () => 4)
  );
  const animationRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const dataArrayRef = useRef();
  const sourceRef = useRef();

  // Real-time audio analysis
  useEffect(() => {
    if (!audioStream) return;

    const setupAudioAnalysis = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // Increased FFT size for 16 bars
        analyserRef.current.smoothingTimeConstant = 0.8;

        // Create data array for frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Connect audio stream to analyser
        sourceRef.current =
          audioContextRef.current.createMediaStreamSource(audioStream);
        sourceRef.current.connect(analyserRef.current);

        // Start real-time analysis
        const analyzeAudio = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // Convert frequency data to bar heights
            const barCount = 14;
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
              // Convert to height (0-255 range to 2-22px range) for better responsiveness
              const height = Math.max(2, (average / 255) * 20 + 2);
              newBars.push(height);
            }

            setWaveformBars(newBars);
            animationRef.current = requestAnimationFrame(analyzeAudio);
          }
        };

        analyzeAudio();
      } catch (error) {
        console.error("Error setting up audio analysis:", error);
        // Fallback to random animation if audio analysis fails
        const animateWaveform = () => {
          setWaveformBars((prev) => prev.map(() => Math.random() * 20 + 2));
          animationRef.current = requestAnimationFrame(animateWaveform);
        };
        animateWaveform();
      }
    };

    setupAudioAnalysis();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream]);

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="recording-ui-container">
      <div className="recording-controls">
        <button
          className="recording-action-btn delete-btn"
          onClick={onDeleteRecording}
          title="Delete recording"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="recording-visual">
          <div className="recording-waveform">
            {waveformBars.map((height, index) => (
              <div
                key={index}
                className="waveform-bar"
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
          <div className="recording-timer">{formatTime(recordingTime)}</div>
        </div>

        <button
          className="recording-action-btn send-btn"
          onClick={onStopRecording}
          title="Stop recording and process"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default DesktopRecordingUI;
