import { useNavigate } from "react-router-dom";

const LessonCard = ({ lesson, isUnlocked, isCompleted, progress }) => {
  const navigate = useNavigate();

  const handleStartLesson = () => {
    if (isUnlocked) {
      navigate(`/listening/lesson/${lesson.id}`);
    }
  };

  const getCardStatus = () => {
    if (isCompleted) return "completed";
    if (isUnlocked) return "unlocked";
    return "locked";
  };

  const getButtonText = () => {
    if (isCompleted) return "Review";
    if (isUnlocked) return "Start";
    return "Locked";
  };

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(99,162,155,0.1)] border border-[rgba(99,162,155,0.15)] transition-all duration-300 cursor-pointer relative overflow-hidden max-w-full w-full h-[350px] sm:h-[380px] flex flex-col justify-start backdrop-blur-[10px] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(99,162,155,0.2)] hover:border-[rgba(99,162,155,0.4)] ${
        !isUnlocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${
        isCompleted
          ? "border-[#10b981] bg-[linear-gradient(135deg,#f0fdf4,#ecfdf5)] shadow-[0_4px_20px_rgba(16,185,129,0.15)]"
          : isUnlocked
          ? "border-[#3b82f6] bg-[linear-gradient(135deg,#f8faff,#f0f4ff)] shadow-[0_4px_20px_rgba(59,130,246,0.15)]"
          : "bg-[linear-gradient(135deg,#f8fafc,#f1f5f9)] border-[#e2e8f0]"
      } before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[linear-gradient(90deg,#63a29b,#275151,#63a29b)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}
      onClick={handleStartLesson}
      role="button"
      tabIndex={isUnlocked ? 0 : -1}
      aria-label={`${lesson.title} - ${
        isUnlocked ? "Click to start" : "Locked lesson"
      }`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleStartLesson();
        }
      }}
    >
      {/* Card Content */}
      <div className="flex-1 flex flex-col gap-3 mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] leading-snug m-0 mb-2">
          {lesson.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed m-0 mb-3">
          {lesson.description}
        </p>

        {/* Progress Section */}
        {isUnlocked && (
          <div className="my-1 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-[0.5px]">
                Progress
              </span>
              <span className="text-xs font-bold text-[#275151]">
                {progress}%
              </span>
            </div>
            <div
              className="bg-[#e2e8f0] h-2 rounded-md overflow-hidden relative"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Lesson progress: ${progress}% complete`}
            >
              <div
                className="bg-[linear-gradient(90deg,#63a29b,#275151,#63a29b)] h-full rounded-md transition-[width] duration-[0.6s] ease-[cubic-bezier(0.4,0,0.2,1)] relative after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] after:animate-shimmer"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mt-2 mb-2">
          <div className="flex items-center gap-1 text-xs text-[#475569] font-medium">
            <span className="text-base opacity-80">⏱️</span>
            <span className="text-xs">{lesson.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#475569] font-medium">
            <span className="text-base opacity-80">📝</span>
            <span className="text-xs">{lesson.exercises.length} exercises</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-2">
        <button
          className={`w-full bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white border-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,162,155,0.3)] relative overflow-hidden ${
            !isUnlocked
              ? "bg-[linear-gradient(135deg,#94a3b8,#64748b)] cursor-not-allowed opacity-60 transform-none shadow-[0_2px_8px_rgba(156,163,175,0.3)]"
              : "hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(99,162,155,0.4)] hover:bg-[linear-gradient(45deg,#275151,#63a29b)] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] before:transition-[left] before:duration-[0.6s] before:ease-in-out hover:before:left-full"
          }`}
          disabled={!isUnlocked}
        >
          <span className="text-base transition-transform duration-300 hover:scale-110">
            {isCompleted ? "🔄" : isUnlocked ? "▶️" : "🔒"}
          </span>
          <span className="font-semibold">{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default LessonCard;
