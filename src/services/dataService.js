// Data service for loading and managing lesson data
import lessonsData from "../data/lessons.json";

class DataService {
  constructor() {
    // Lazy load lessons to improve initial performance
    this.lessons = null;
    this.tipsDatabase = lessonsData.tipsDatabase;
    this.isInitialized = false;
  }

  // Initialize lessons only when needed
  initializeLessons() {
    if (!this.isInitialized) {
      // Use real lessons from JSON file instead of generated ones
      this.lessons = lessonsData.lessons;
      this.lessons = this.lessons.map((lesson, index) => ({
        ...lesson,
        // Extract video ID from full YouTube URL for iframe embedding
        youtubeVideoId: this.extractVideoId(lesson.youtubeVideoId),
        isUnlocked: index === 0, // Only first lesson is unlocked by default
        isCompleted: false,
        progress: 0,
        order: index + 1,
      }));
      this.isInitialized = true;
      this.loadProgress();
    }
  }

  // Extract video ID from YouTube URL
  extractVideoId(url) {
    if (!url) return null;

    // If it's already just a video ID, return it
    if (!url.includes("youtube.com")) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return url; // Return original if no pattern matches
  }

  // Get all lessons
  getAllLessons() {
    this.initializeLessons();
    return this.lessons;
  }

  // Get lessons with pagination
  getLessons(page = 1, limit = 20) {
    this.initializeLessons();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return this.lessons.slice(startIndex, endIndex);
  }

  // Get total number of lessons
  getTotalLessons() {
    this.initializeLessons();
    return this.lessons.length;
  }

  // Get a specific lesson by ID
  getLessonById(id) {
    this.initializeLessons();
    return this.lessons.find((lesson) => lesson.id === parseInt(id));
  }

  // Get tips database
  getTipsDatabase() {
    return this.tipsDatabase;
  }

  // Check if lesson is unlocked
  isLessonUnlocked(lessonId) {
    this.initializeLessons();
    const lesson = this.getLessonById(lessonId);
    return lesson ? lesson.isUnlocked : false;
  }

  // Check if lesson is completed
  isLessonCompleted(lessonId) {
    this.initializeLessons();
    const lesson = this.getLessonById(lessonId);
    return lesson ? lesson.isCompleted : false;
  }

  // Unlock a lesson
  unlockLesson(lessonId) {
    this.initializeLessons();
    const lesson = this.getLessonById(lessonId);
    if (lesson) {
      lesson.isUnlocked = true;
      this.saveProgress();
    }
  }

  // Mark lesson as completed
  completeLesson(lessonId) {
    this.initializeLessons();
    const lesson = this.getLessonById(lessonId);
    if (lesson) {
      lesson.isCompleted = true;
      lesson.progress = 100;

      // Unlock next lesson
      const nextLessonId = lessonId + 1;
      if (nextLessonId <= this.lessons.length) {
        this.unlockLesson(nextLessonId);
      }

      this.saveProgress();
    }
  }

  // Update lesson progress
  updateLessonProgress(lessonId, progress) {
    this.initializeLessons();
    const lesson = this.getLessonById(lessonId);
    if (lesson) {
      lesson.progress = Math.min(100, Math.max(0, progress));
      this.saveProgress();
    }
  }

  // Save progress to localStorage
  saveProgress() {
    try {
      const progressData = this.lessons.map((lesson) => ({
        id: lesson.id,
        isUnlocked: lesson.isUnlocked,
        isCompleted: lesson.isCompleted,
        progress: lesson.progress,
      }));
      localStorage.setItem("sna-lesson-progress", JSON.stringify(progressData));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }

  // Load progress from localStorage
  loadProgress() {
    try {
      const savedProgress = localStorage.getItem("sna-lesson-progress");
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        progressData.forEach((progress) => {
          const lesson = this.getLessonById(progress.id);
          if (lesson) {
            lesson.isUnlocked = progress.isUnlocked;
            lesson.isCompleted = progress.isCompleted;
            lesson.progress = progress.progress;
          }
        });
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  }

  // Get user's overall progress
  getOverallProgress() {
    this.initializeLessons();
    const completedLessons = this.lessons.filter(
      (lesson) => lesson.isCompleted
    ).length;
    const totalLessons = this.lessons.length;
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: Math.round((completedLessons / totalLessons) * 100),
    };
  }

  // Reset all progress
  resetProgress() {
    this.initializeLessons();
    this.lessons.forEach((lesson, index) => {
      lesson.isUnlocked = index === 0;
      lesson.isCompleted = false;
      lesson.progress = 0;
    });
    this.saveProgress();
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
