import { useState, useRef, useCallback, useEffect } from "react";

export function useVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);

  // Play video
  const play = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing video:", err);
      setError("Failed to play video");
    }
  }, []);

  // Pause video
  const pause = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to specific time
  const seekTo = useCallback((time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Set video source
  const setVideoSource = useCallback((src) => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    videoRef.current.src = src;
    videoRef.current.load();
  }, []);

  // Handle video events
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback((event) => {
    console.error("Video error:", event);
    setError("Failed to load video");
    setIsLoading(false);
  }, []);

  const handleUserInteraction = useCallback(() => {
    setHasUserInteracted(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    hasUserInteracted,
    isLoading,
    error,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setVideoSource,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleUserInteraction,
  };
}
