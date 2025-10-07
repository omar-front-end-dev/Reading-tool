import { useEffect } from "react";
import dataService from "../services/dataService";

// Custom hook for managing lesson progress
export const useProgress = (lessonId) => {
  useEffect(() => {
    // Load progress when component mounts
    dataService.loadProgress();
  }, []);

  const updateProgress = (progress) => {
    dataService.updateLessonProgress(lessonId, progress);
  };

  const completeLesson = (lessonId) => {
    dataService.completeLesson(lessonId);
  };

  const getProgress = () => {
    return dataService.getOverallProgress();
  };

  return {
    updateProgress,
    completeLesson,
    getProgress,
  };
};

export default useProgress;
