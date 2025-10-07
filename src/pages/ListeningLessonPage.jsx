import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dataService from "../services/dataService";
import ListeningPhase from "../components/Listening/LessonPhase/ListeningPhase";
import DictationPhase from "../components/Listening/LessonPhase/DictationPhase";
import Header from "../components/Listening/Header";
import TipsPanel from "../components/Listening/TipsPanel";

export const ListeningLessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState("listening");
  const [showTips, setShowTips] = useState(false);
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const foundLesson = dataService.getLessonById(parseInt(id));
    if (foundLesson) {
      // Check if lesson is unlocked
      if (!dataService.isLessonUnlocked(parseInt(id))) {
        alert("This lesson is locked. Complete the previous lesson first!");
        navigate("/");
        return;
      }
      setLesson(foundLesson);
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  const phases = [
    { id: "listening", name: "Listening", icon: "🎧" },
    { id: "dictation", name: "Dictation", icon: "✏️" },
  ];

  const handleLessonComplete = () => {
    dataService.completeLesson(parseInt(id));
    alert("Congratulations! You have completed this lesson!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fffe_0%,#f0f9f8_50%,#e6f7f5_100%)]">
      <Header onToggleTips={() => setShowTips(!showTips)} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Lesson Header */}
        <div className="bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-6 sm:mb-8 shadow-[0_20px_40px_rgba(99,162,155,0.2)] text-white relative overflow-hidden before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] before:animate-float">
          <div className="relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 bg-[linear-gradient(135deg,#ffffff_0%,#e6f7f5_100%)] bg-clip-text text-transparent leading-tight">
              {lesson.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
              {lesson.description}
            </p>

            <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-3 border border-white/30 transition-all duration-300 hover:bg-white/30 hover:-translate-y-1">
                <span className="text-lg">⏱️</span>
                <span className="font-semibold text-sm">{lesson.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-3 border border-white/30 transition-all duration-300 hover:bg-white/30 hover:-translate-y-1">
                <span className="text-lg">📝</span>
                <span className="font-semibold text-sm">
                  {lesson.exercises.length} exercises
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-3 border border-white/30 transition-all duration-300 hover:bg-white/30 hover:-translate-y-1">
                <span className="text-lg">🎯</span>
                <span className="font-semibold text-sm">
                  Lesson {lesson.id} of 60
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
          {phases.map((phase) => (
            <div
              key={phase.id}
              onClick={() => setCurrentPhase(phase.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-[rgba(99,162,155,0.2)] rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 font-semibold text-[#334155] shadow-[0_4px_12px_rgba(99,162,155,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,162,155,0.2)] hover:border-[rgba(99,162,155,0.4)] ${
                currentPhase === phase.id
                  ? "bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white border-[#63a29b] shadow-[0_8px_20px_rgba(99,162,155,0.3)]"
                  : ""
              }`}
            >
              <span className="text-base sm:text-lg">{phase.icon}</span>
              <span className="text-sm sm:text-base">{phase.name}</span>
            </div>
          ))}
        </div>

        {/* Phase Content */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_10px_25px_rgba(99,162,155,0.1)] border border-[rgba(99,162,155,0.1)] min-h-[300px] sm:min-h-[400px]">
          {currentPhase === "listening" && (
            <ListeningPhase
              lesson={lesson}
              onComplete={() => setCurrentPhase("dictation")}
            />
          )}

          {currentPhase === "dictation" && (
            <DictationPhase lesson={lesson} onComplete={handleLessonComplete} />
          )}
        </div>
      </div>

      {/* Tips Panel */}
      <TipsPanel isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};