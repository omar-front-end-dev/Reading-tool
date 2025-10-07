import { useState, useCallback } from "react";

export const usePronunciationScoring = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const calculatePronunciationScore = useCallback(
    async (recordedAudio, targetText) => {
      if (!recordedAudio || !targetText) {
        return { score: 0, recognizedText: "", missingWords: [] };
      }

      setIsProcessing(true);

      try {
        // Convert audio to text using Web Speech API
        const recognizedText = await speechToText(recordedAudio, targetText);

        if (!recognizedText) {
          return {
            score: 0,
            recognizedText: "No speech detected",
            missingWords: [],
          };
        }

        // Calculate pronunciation score
        const score = calculateScore(recognizedText, targetText);
        setLastScore(score);

        // Find missing words
        const missingWords = findMissingWords(recognizedText, targetText);

        return {
          score,
          recognizedText,
          missingWords,
        };
      } catch (error) {
        console.error("Error calculating pronunciation score:", error);
        return {
          score: 0,
          recognizedText: "Error processing audio",
          missingWords: [],
        };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const speechToText = async (audioBlob, targetText) => {
    try {
      // Skip Web Speech API for now as it doesn't work with audio blobs
      // Go directly to Assembly.ai
      return await useAssemblyAI(audioBlob, targetText);
    } catch (error) {
      console.error("Speech recognition error:", error);
      return ""; // Return empty string instead of target text
    }
  };

  const useWebSpeechAPI = (audioBlob) => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        // If no result, resolve with empty string
        resolve("");
      };

      recognition.start();
    });
  };

  const useAssemblyAI = async (audioBlob, targetText) => {
    try {
      // Upload audio to Assembly.ai - send as binary data

      // Send the audio blob directly as binary data
      const response = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization:
            import.meta.env.VITE_ASSEMBLY_AI_API_KEY ||
            "bdb00961a07c4184889a80206c52b6f2",
          "Content-Type": audioBlob.type, // Set the MIME type directly
        },
        body: audioBlob, // Send the blob directly
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Assembly.ai upload failed:", errorText);
        throw new Error(
          `Failed to upload audio: ${response.status} ${errorText}`
        );
      }

      const { upload_url } = await response.json();

      // Submit for transcription
      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            authorization:
              import.meta.env.VITE_ASSEMBLY_AI_API_KEY ||
              "bdb00961a07c4184889a80206c52b6f2",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            audio_url: upload_url,
            language_code: "en_us",
          }),
        }
      );

      if (!transcriptResponse.ok) {
        const errorText = await transcriptResponse.text();
        console.error("Transcription submission failed:", errorText);
        throw new Error(
          `Failed to submit transcription: ${transcriptResponse.status} ${errorText}`
        );
      }

      const { id } = await transcriptResponse.json();

      // Poll for results
      let transcript = "";
      let pollCount = 0;
      const maxPolls = 30; // 30 seconds max

      while (pollCount < maxPolls) {
        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            headers: {
              authorization:
                import.meta.env.VITE_ASSEMBLY_AI_API_KEY ||
                "bdb00961a07c4184889a80206c52b6f2",
            },
          }
        );

        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          transcript = statusData.text;
          break;
        } else if (statusData.status === "error") {
          console.error("Transcription failed:", statusData.error);
          throw new Error("Transcription failed");
        }

        // Wait 1 second before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        pollCount++;
      }

      if (pollCount >= maxPolls) {
        return ""; // Return empty string instead of target text
      }

      return transcript || ""; // Return empty string instead of target text
    } catch (error) {
      console.error("Assembly.ai error:", error);
      // Return empty string instead of target text to avoid false high scores
      return "";
    }
  };

  const calculateScore = (recognizedText, targetText) => {
    // Normalize both texts by removing punctuation for better comparison
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

    const target = normalizeText(targetText);
    const recognized = normalizeText(recognizedText);

    if (target === recognized) {
      return 100;
    }

    // Calculate word-level accuracy
    const targetWords = target.split(/\s+/);
    const recognizedWords = recognized.split(/\s+/);

    let correctWords = 0;
    const totalWords = targetWords.length;

    // Check each target word against recognized words
    targetWords.forEach((targetWord) => {
      if (
        recognizedWords.some(
          (recognizedWord) =>
            recognizedWord === targetWord || // Exact match
            recognizedWord.includes(targetWord) ||
            targetWord.includes(recognizedWord)
        )
      ) {
        correctWords++;
      }
    });

    // Calculate percentage
    const wordAccuracy = (correctWords / totalWords) * 100;

    // Apply some additional scoring logic
    let finalScore = wordAccuracy;

    // Bonus for very close matches (all words present, just different order)
    if (
      correctWords === totalWords &&
      recognizedWords.length === targetWords.length
    ) {
      finalScore = Math.min(100, finalScore + 5);
    }

    // Penalty for very short responses
    if (recognizedWords.length < targetWords.length * 0.5) {
      finalScore *= 0.7;
    }

    // Penalty for very long responses (too many extra words)
    if (recognizedWords.length > targetWords.length * 1.5) {
      finalScore *= 0.9;
    }

    return Math.round(Math.max(0, Math.min(100, finalScore)));
  };

  const findMissingWords = (recognizedText, targetText) => {
    const targetWords = targetText.toLowerCase().trim().split(/\s+/);
    const recognizedWords = recognizedText.toLowerCase().trim().split(/\s+/);

    const missingWords = targetWords.filter(
      (targetWord) =>
        !recognizedWords.some(
          (recognizedWord) =>
            recognizedWord.includes(targetWord) ||
            targetWord.includes(recognizedWord)
        )
    );

    return missingWords;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#20c997"; // Green
    if (score >= 60) return "#ffc107"; // Yellow
    return "#dc3545"; // Red
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Very good!";
    if (score >= 70) return "Good!";
    if (score >= 60) return "Not bad!";
    if (score >= 40) return "Keep practicing!";
    return "Try again!";
  };

  return {
    isProcessing,
    lastScore,
    calculatePronunciationScore,
    getScoreColor,
    getScoreMessage,
  };
};
