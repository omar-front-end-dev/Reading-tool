import { useState, useEffect, useCallback } from "react";

export const useMobileFeatures = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // iOS Viewport Height Fix
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      setViewportHeight(vh);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", () => {
      setTimeout(updateViewportHeight, 100);
    });

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  // Enhanced Touch Support
  useEffect(() => {
    if (!isMobile) return;

    const addTouchFeedback = () => {
      const interactiveElements = document.querySelectorAll(
        "button, .control-btn, .mic-button, .waveform-btn"
      );

      interactiveElements.forEach((element) => {
        // Add touch start effect
        element.addEventListener(
          "touchstart",
          function (e) {
            this.style.transform = "scale(0.95)";
            this.style.transition = "transform 0.1s ease";
          },
          { passive: true }
        );

        // Add touch end effect
        element.addEventListener(
          "touchend",
          function (e) {
            setTimeout(() => {
              this.style.transform = "scale(1)";
            }, 100);
          },
          { passive: true }
        );

        // Add touch cancel effect
        element.addEventListener(
          "touchcancel",
          function (e) {
            this.style.transform = "scale(1)";
          },
          { passive: true }
        );
      });
    };

    // Add touch feedback after a short delay to ensure elements are rendered
    const timeoutId = setTimeout(addTouchFeedback, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  // Enhanced Accessibility for Mobile
  const setupMobileAccessibility = useCallback(() => {
    if (!isMobile) return;

    // Announce recording state changes
    const announcements = document.getElementById("announcements");
    if (announcements) {
      // This would be called when recording state changes
      const announceRecordingState = (isRecording) => {
        if (isRecording) {
          announcements.textContent = "Recording started. Speak now.";
        } else {
          announcements.textContent = "Recording stopped. Processing audio.";
        }
      };

      return announceRecordingState;
    }
  }, [isMobile]);

  // Keyboard Navigation Enhancement for Mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleKeyDown = (e) => {
      // Space bar to start/stop recording
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        const micButton = document.getElementById("micButton");
        if (micButton && !micButton.disabled) {
          micButton.click();
        }
      }

      // Enter to continue/retry
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        const activeDialog = document.querySelector(".dialog-container.active");
        if (activeDialog) {
          const nextBtn = document.getElementById("nextButton");
          const retryBtn = document.getElementById("retryButton");
          if (nextBtn && nextBtn.style.display !== "none") {
            nextBtn.click();
          } else if (retryBtn && retryBtn.style.display !== "none") {
            retryBtn.click();
          }
        }
      }

      // Escape to close dialog
      if (e.code === "Escape") {
        const activeDialog = document.querySelector(".dialog-container.active");
        if (activeDialog) {
          const closeBtn = document.querySelector(".close-btn");
          if (closeBtn) closeBtn.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Enhanced Error Handling for Mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleError = (e) => {
      console.error("Global error caught:", e.error);

      // Show user-friendly error message
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "alert alert-danger alert-dismissible fade show position-fixed";
      errorDiv.style.top = "20px";
      errorDiv.style.right = "20px";
      errorDiv.style.zIndex = "9999";
      errorDiv.style.maxWidth = "300px";
      errorDiv.innerHTML = `
        <strong>Oops!</strong> Something went wrong. Please refresh the page and try again.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;

      document.body.appendChild(errorDiv);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [isMobile]);

  // Mobile-specific audio enable function
  const enableVideoAudio = useCallback(() => {
    const video = document.getElementById("mobileLessonVideo");
    if (video) {
      video.muted = false;
    }
  }, []);

  // Mobile-specific speech functions
  const mobileSpeakSentence = useCallback(
    (sentence, slow = false) => {
      if (!sentence) return;

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = slow ? 0.7 : 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Enable video audio on user interaction
      enableVideoAudio();

      window.speechSynthesis.speak(utterance);
    },
    [enableVideoAudio]
  );

  // Mobile-specific audio playback
  const playMobileRecordedAudioSlow = useCallback((audioBlob) => {
    if (!audioBlob) return;

    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    audio.playbackRate = 0.7; // Slow down playback
    audio.play();

    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
    };

    audio.onerror = () => {
      console.error("Error playing recorded audio");
      URL.revokeObjectURL(audio.src);
    };
  }, []);

  // Mobile alert function
  const showMobileAlert = useCallback((message) => {
    const alertContainer = document.getElementById("mobileAlertContainer");
    const alertMessage = document.getElementById("mobileAlertMessage");

    if (alertContainer && alertMessage) {
      alertMessage.textContent = message;
      alertContainer.style.display = "block";
    }
  }, []);

  // Hide mobile alert
  const hideMobileAlert = useCallback(() => {
    const alertContainer = document.getElementById("mobileAlertContainer");
    if (alertContainer) {
      alertContainer.style.display = "none";
    }
  }, []);

  return {
    isMobile,
    viewportHeight,
    setupMobileAccessibility,
    enableVideoAudio,
    mobileSpeakSentence,
    playMobileRecordedAudioSlow,
    showMobileAlert,
    hideMobileAlert,
  };
};
