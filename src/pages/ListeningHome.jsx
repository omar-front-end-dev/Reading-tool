import { useState, useEffect } from "react";
import dataService from "../services/dataService";
import LessonCard from "../components/Listening/LessonCard";
import Header from "../components/Listening/Header";
import TipsPanel from "../components/Listening/TipsPanel";
import useProgress from "../hooks/useProgress";

export const ListeningHome = () => {
  const [showTips, setShowTips] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const lessonsPerPage = 20;
  const { getProgress } = useProgress();

  useEffect(() => {
    loadLessons();
    updateProgress();
  }, [currentPage]);

  // Refresh progress when component becomes visible (returning from lesson)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateProgress();
        // Reload lessons to get updated progress
        const pageLessons = dataService.getLessons(currentPage, lessonsPerPage);
        setLessons(pageLessons);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentPage]);

  const updateProgress = () => {
    setProgress(getProgress());
  };

  const loadLessons = () => {
    setLoading(true);
    const pageLessons = dataService.getLessons(currentPage, lessonsPerPage);
    const totalLessons = dataService.getTotalLessons();

    if (currentPage === 1) {
      setLessons(pageLessons);
    } else {
      setLessons((prev) => [...prev, ...pageLessons]);
    }

    setHasMore(currentPage * lessonsPerPage < totalLessons);
    setLoading(false);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Header onToggleTips={() => setShowTips(!showTips)} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] rounded-xl sm:rounded-2xl py-6 sm:py-10 mb-6 sm:mb-8 shadow-[0_10px_30px_rgba(39,81,81,0.15)] text-center text-white before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] before:animate-float">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 bg-[linear-gradient(135deg,#ffffff_0%,#e6f7f5_100%)] bg-clip-text text-transparent leading-tight">
                SNA Academy
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-[800px] mx-auto mb-6 sm:mb-8 leading-relaxed font-normal px-4">
                Master English through Interactive Listening and Dictation
              </p>

              {/* Compact Progress */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 max-w-sm sm:max-w-md mx-auto border border-white/20">
                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {progress.completed}
                    </div>
                    <div className="text-emerald-300 font-medium text-xs uppercase tracking-wide">
                      Completed
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {progress.total - progress.completed}
                    </div>
                    <div className="text-slate-300 font-medium text-xs uppercase tracking-wide">
                      Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="lessons-section">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
            Available Lessons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 p-0">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <LessonCard
                  lesson={lesson}
                  isUnlocked={lesson.isUnlocked}
                  isCompleted={lesson.isCompleted}
                  progress={lesson.progress}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none cursor-pointer transition-all duration-300 text-base sm:text-lg shadow-[0_8px_25px_rgba(99,162,155,0.3)] relative overflow-hidden backdrop-blur-sm hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(99,162,155,0.4)] hover:bg-[linear-gradient(45deg,#275151,#63a29b)] disabled:bg-[linear-gradient(135deg,#94a3b8,#64748b)] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_4px_12px_rgba(156,163,175,0.3)] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] before:transition-[left] before:duration-[0.6s] before:ease-in-out hover:before:left-full disabled:before:hidden"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>📚</span>
                  <span>Load More Lessons</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tips Panel */}
      <TipsPanel isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};
