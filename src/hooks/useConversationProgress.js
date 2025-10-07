import { useState, useCallback, useEffect } from "react";
import { useProgress } from "../contexts/ProgressContext";

export const useConversationProgress = (conversationId, totalSentences) => {
  const {
    updateConversationProgress,
    updateSentenceProgress,
    getConversationProgress,
  } = useProgress();

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentenceScores, setSentenceScores] = useState([]);
  const [completedSentences, setCompletedSentences] = useState(new Set());
  const [overallScore, setOverallScore] = useState(0);

  // Calculate progress percentage
  const progressPercentage = Math.round(
    (completedSentences.size / totalSentences) * 100
  );

  // Update overall score when sentence scores change
  useEffect(() => {
    if (sentenceScores.length > 0) {
      const averageScore =
        sentenceScores.reduce((sum, score) => sum + score, 0) /
        sentenceScores.length;
      setOverallScore(Math.round(averageScore));
    }
  }, [sentenceScores]);

  const completeSentence = useCallback(
    (sentenceIndex, score) => {
      // Update local state
      const newCompletedSentences = new Set([
        ...completedSentences,
        sentenceIndex,
      ]);
      setCompletedSentences(newCompletedSentences);

      setSentenceScores((prev) => {
        const newScores = [...prev];
        newScores[sentenceIndex] = score;
        return newScores;
      });

      // Update global progress
      const sentenceId = `${conversationId}-${sentenceIndex}`;
      updateSentenceProgress(sentenceId, true, score);

      // Check if conversation is now completed
      const isConversationNowCompleted =
        newCompletedSentences.size === totalSentences;

      // Move to next sentence or complete conversation
      if (sentenceIndex < totalSentences - 1) {
        setCurrentSentenceIndex(sentenceIndex + 1);
      }

      // If this is the last sentence or all sentences are completed, mark conversation as complete
      if (isConversationNowCompleted) {
        const allScores = [...sentenceScores];
        allScores[sentenceIndex] = score;

        const finalScore =
          allScores.length > 0
            ? Math.round(
                allScores.reduce((sum, s) => sum + s, 0) / allScores.length
              )
            : score;

        // Mark conversation as completed with final score
        updateConversationProgress(conversationId, 100, finalScore);

        // Trigger conversation completion callback if provided
        if (window.onConversationCompleted) {
          window.onConversationCompleted(conversationId, finalScore);
        }
      }
    },
    [
      conversationId,
      totalSentences,
      sentenceScores,
      completedSentences,
      updateSentenceProgress,
      updateConversationProgress,
    ]
  );

  const retrySentence = useCallback(() => {
    // Reset current sentence for retry
    setCurrentSentenceIndex(0);
  }, []);

  const resetConversation = useCallback(() => {
    setCurrentSentenceIndex(0);
    setSentenceScores([]);
    setCompletedSentences(new Set());
    setOverallScore(0);
  }, []);

  const isConversationCompleted = completedSentences.size === totalSentences;
  const isCurrentSentenceCompleted =
    completedSentences.has(currentSentenceIndex);

  return {
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
  };
};
