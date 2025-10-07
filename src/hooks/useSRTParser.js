import { useState, useCallback } from "react";

/**
 * Custom hook for parsing SRT subtitle files
 * Based on the reference implementation in records.js
 */
const useSRTParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Parse SRT content into subtitle objects
   * Handles the specific format with English and Arabic subtitles
   * @param {string} srtContent - Raw SRT file content
   * @returns {Array} Array of subtitle objects with timing and text
   */
  const parseSRT = useCallback((srtContent) => {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\s*\n/);

    // The SRT file has 6 blocks: first 3 are English, last 3 are Arabic
    if (blocks.length >= 6) {
      const englishBlocks = blocks.slice(0, 3); // First 3 blocks
      const arabicBlocks = blocks.slice(3, 6); // Last 3 blocks

      // Process each pair of English/Arabic blocks
      for (let i = 0; i < 3; i++) {
        const englishBlock = englishBlocks[i];
        const arabicBlock = arabicBlocks[i];

        if (englishBlock && arabicBlock) {
          const englishLines = englishBlock.split("\n");
          const arabicLines = arabicBlock.split("\n");

          if (englishLines.length >= 3 && arabicLines.length >= 3) {
            // Parse timing from English block (format: "00:00:00,000 --> 00:00:05,000")
            const timingLine = englishLines[1];
            const timingMatch = timingLine.match(
              /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
            );

            if (timingMatch) {
              const startTime = parseTimeToMs(
                timingMatch[1],
                timingMatch[2],
                timingMatch[3],
                timingMatch[4]
              );
              const endTime = parseTimeToMs(
                timingMatch[5],
                timingMatch[6],
                timingMatch[7],
                timingMatch[8]
              );

              const englishText = englishLines.slice(2).join(" ").trim();
              const arabicText = arabicLines.slice(2).join(" ").trim();

              if (englishText && arabicText) {
                subtitles.push({
                  startTime,
                  endTime,
                  englishText,
                  arabicText,
                  index: subtitles.length,
                });
              }
            }
          }
        }
      }
    } else {
    }

    return subtitles;
  }, []);

  /**
   * Convert time components to milliseconds
   * @param {string} hours - Hours component
   * @param {string} minutes - Minutes component
   * @param {string} seconds - Seconds component
   * @param {string} milliseconds - Milliseconds component
   * @returns {number} Total time in milliseconds
   */
  const parseTimeToMs = (hours, minutes, seconds, milliseconds) => {
    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseInt(seconds) * 1000 +
      parseInt(milliseconds)
    );
  };

  /**
   * Load and parse SRT file from public/subtitles directory
   * @param {number} lessonNumber - Lesson number
   * @param {number} topicId - Topic ID
   * @param {number} conversationId - Conversation ID
   * @param {number} sentenceIndex - Sentence index (1-based)
   * @returns {Promise<Array>} Promise resolving to parsed subtitles array
   */
  const loadSRTFile = useCallback(
    async (lessonNumber, topicId, conversationId, sentenceIndex) => {
      setIsLoading(true);
      setError(null);

      try {
        // Construct SRT file path based on the naming convention
        const fileName = `lesson${lessonNumber}_topic${topicId}_conversation${conversationId}_sentence${sentenceIndex}.srt`;
        const filePath = `/subtitles/${fileName}`;

        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error(
            `Failed to load SRT file: ${response.status} ${response.statusText}`
          );
        }

        const srtContent = await response.text();

        if (!srtContent.trim()) {
          throw new Error("SRT file is empty");
        }

        const parsedSubtitles = parseSRT(srtContent);

        setIsLoading(false);
        return parsedSubtitles;
      } catch (err) {
        console.error(`Error loading SRT file:`, err);
        setError(err.message);
        setIsLoading(false);
        return [];
      }
    },
    [parseSRT]
  );

  /**
   * Find the current subtitle based on video time
   * @param {Array} subtitles - Array of parsed subtitles
   * @param {number} currentTime - Current video time in seconds
   * @returns {Object|null} Current subtitle object or null
   */
  const getCurrentSubtitle = useCallback((subtitles, currentTime) => {
    if (!subtitles || subtitles.length === 0) return null;

    const currentTimeMs = currentTime * 1000;

    return (
      subtitles.find(
        (subtitle) =>
          currentTimeMs >= subtitle.startTime &&
          currentTimeMs <= subtitle.endTime
      ) || null
    );
  }, []);

  return {
    isLoading,
    error,
    parseSRT,
    loadSRTFile,
    getCurrentSubtitle,
  };
};

export default useSRTParser;
