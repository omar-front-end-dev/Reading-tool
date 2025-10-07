import React from "react";

const FeedbackDisplay = ({ feedback, onNext, onRetry, isLastExercise }) => {
  const { type, isCorrect, analysis, correctAnswer } = feedback;

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return "from-green-400 to-green-600";
    if (accuracy >= 70) return "from-blue-400 to-blue-600";
    if (accuracy >= 50) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getFeedbackMessage = (accuracy) => {
    if (accuracy >= 90) return "Great job! Almost perfect!";
    if (accuracy >= 70) return "Good effort! Keep practicing!";
    if (accuracy >= 50) return "Not bad, but needs improvement.";
    return "Needs more practice. Listen carefully and try again!";
  };

  const getImprovementTips = (analysis) => {
    const tips = [];

    if (analysis.missing > 0) {
      tips.push("Listen carefully for missing words");
    }
    if (analysis.extra > 0) {
      tips.push("Avoid adding extra words that weren't in the audio");
    }
    if (analysis.mistakes > 0) {
      tips.push("Pay attention to word endings and small differences");
    }
    if (tips.length === 0) {
      tips.push("You're doing great! Just a few minor adjustments needed");
    }

    return tips;
  };

  if (type === "writing" && analysis) {
    return (
      <div className="text-center p-3 sm:p-5 rounded-lg sm:rounded-xl m-2 sm:m-5 font-semibold text-base sm:text-lg opacity-100 transform-none transition-all duration-300 w-full break-words bg-[linear-gradient(135deg,#f0f9ff,#e0f2fe)] text-[#275151] border-2 border-[#63a29b] text-left p-4 sm:p-6 max-w-[800px] mx-auto w-full">
        {analysis.isPerfect ? (
          // Perfect Answer
          <div className="text-center mt-3 sm:mt-5 w-full">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">🎉</span>
              <span className="text-lg sm:text-xl font-bold">
                Perfect! Every word is correct!
              </span>
            </div>
            <div className="bg-[#d1fae5] text-[#065f46] p-3 sm:p-4 rounded-lg border-2 border-[#275151] text-sm sm:text-lg mt-2 inline-block max-w-full break-words">
              {analysis.userAnswer || "Perfect match!"}
            </div>
            <div className="flex gap-2 sm:gap-4 justify-center items-center flex-wrap mt-4 sm:mt-5">
              <button
                onClick={onRetry}
                className="bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white border-2 border-[#d97706] px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center hover:bg-[linear-gradient(135deg,#d97706,#b45309)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(245,158,11,0.3)]"
              >
                <span className="text-base sm:text-lg">🔄</span>
                <span className="hidden sm:inline">Try Again</span>
                <span className="sm:hidden">Retry</span>
              </button>
              <button
                onClick={onNext}
                className="bg-[linear-gradient(135deg,#63a29b,#275151)] text-white border-2 border-[#275151] px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center hover:bg-[linear-gradient(135deg,#275151,#1a4a4a)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(99,162,155,0.4)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(99,162,155,0.3)]"
              >
                <span className="text-base sm:text-lg">→</span>
                <span className="hidden sm:inline">
                  {isLastExercise ? "Complete Lesson" : "Next Exercise"}
                </span>
                <span className="sm:hidden">
                  {isLastExercise ? "Complete" : "Next"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Detailed Analysis
          <div className="flex flex-col gap-3 sm:gap-5 w-full">
            {/* Accuracy Header */}
            <div className="flex flex-col sm:flex-row justify-center m-2 sm:m-4 flex-wrap gap-3 sm:gap-4">
              <div className="flex flex-col items-center justify-center w-[100px] sm:w-[120px] h-[100px] sm:h-[120px] rounded-full bg-[linear-gradient(135deg,#63a29b,#275151)] text-white shadow-[0_8px_25px_rgba(99,162,155,0.3)] flex-shrink-0 mx-auto sm:mx-0">
                <div className="text-xl sm:text-2xl font-bold leading-none">
                  {analysis.accuracy}%
                </div>
                <div className="text-xs sm:text-sm mt-1 opacity-90">
                  Accuracy
                </div>
              </div>
              <div className="sm:ml-5 text-center sm:text-left text-[#334155] max-w-[300px] w-full mx-auto sm:mx-0">
                <p className="mt-2 text-sm sm:text-base">
                  You got {analysis.correctWords} out of {analysis.totalWords}{" "}
                  words correct!
                </p>
                <p className="text-sm sm:text-base">
                  {getFeedbackMessage(analysis.accuracy)}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:flex sm:justify-center gap-3 sm:gap-5 flex-wrap m-2 sm:m-4 w-full">
              <div className="text-center bg-white p-3 sm:p-4 flex-shrink-0 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] min-w-[80px] sm:min-w-[100px] border border-[#e2e8f0]">
                <div className="text-xl sm:text-2xl font-bold text-[#63a29b] mb-1">
                  {analysis.correctWords}
                </div>
                <div className="text-xs sm:text-sm font-medium">Correct</div>
              </div>
              <div className="text-center bg-white p-3 sm:p-4 flex-shrink-0 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] min-w-[80px] sm:min-w-[100px] border border-[#e2e8f0]">
                <div className="text-xl sm:text-2xl font-bold text-[#ef4444] mb-1">
                  {analysis.mistakes}
                </div>
                <div className="text-xs sm:text-sm font-medium">Mistakes</div>
              </div>
              <div className="text-center bg-white p-3 sm:p-4 flex-shrink-0 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] min-w-[80px] sm:min-w-[100px] border border-[#e2e8f0]">
                <div className="text-xl sm:text-2xl font-bold text-[#f59e0b] mb-1">
                  {analysis.missing}
                </div>
                <div className="text-xs sm:text-sm font-medium">Missing</div>
              </div>
              <div className="text-center bg-white p-3 sm:p-4 flex-shrink-0 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] min-w-[80px] sm:min-w-[100px] border border-[#e2e8f0]">
                <div className="text-xl sm:text-2xl font-bold text-[#f59e0b] mb-1">
                  {analysis.extra}
                </div>
                <div className="text-xs sm:text-sm font-medium">Extra</div>
              </div>
            </div>

            {/* Answer Comparison */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-3 sm:mt-5 w-full">
              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-[#e2e8f0] min-h-[50px] sm:min-h-[60px] flex items-center w-full break-words overflow-wrap-break-word">
                <div className="w-full">
                  <h4 className="mb-2 text-sm sm:text-base text-[#334155] font-semibold">
                    Your Answer
                  </h4>
                  <div
                    className="leading-relaxed text-sm sm:text-base min-h-[50px] sm:min-h-[60px] flex items-center w-full break-words overflow-wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html:
                        analysis.userAnalysis ||
                        analysis.userAnswer ||
                        "No answer provided",
                    }}
                  />
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-[#e2e8f0] min-h-[50px] sm:min-h-[60px] flex items-center w-full break-words overflow-wrap-break-word">
                <div className="w-full">
                  <h4 className="mb-2 text-sm sm:text-base text-[#334155] font-semibold">
                    Correct Answer
                  </h4>
                  <div
                    className="leading-relaxed text-sm sm:text-base min-h-[50px] sm:min-h-[60px] flex items-center w-full break-words overflow-wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html:
                        analysis.correctAnalysis || analysis.correctAnswer,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="flex gap-2 sm:gap-4 justify-center items-center flex-wrap mt-4 sm:mt-5">
                <button
                  onClick={onRetry}
                  className="bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white border-2 border-[#d97706] px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center hover:bg-[linear-gradient(135deg,#d97706,#b45309)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(245,158,11,0.3)]"
                >
                  <span className="text-base sm:text-lg">🔄</span>
                  <span className="hidden sm:inline">Try Again</span>
                  <span className="sm:hidden">Retry</span>
                </button>
                <button
                  onClick={onNext}
                  className="bg-[linear-gradient(135deg,#63a29b,#275151)] text-white border-2 border-[#275151] px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center hover:bg-[linear-gradient(135deg,#275151,#1a4a4a)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(99,162,155,0.4)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(99,162,155,0.3)]"
                >
                  <span className="text-base sm:text-lg">→</span>
                  <span className="hidden sm:inline">
                    {isLastExercise ? "Complete Lesson" : "Next Exercise"}
                  </span>
                  <span className="sm:hidden">
                    {isLastExercise ? "Complete" : "Next"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Multiple Choice Feedback
  return (
    <div
      className={`text-center p-3 sm:p-5 rounded-lg sm:rounded-xl m-2 sm:m-5 font-semibold text-base sm:text-lg opacity-100 transform-none transition-all duration-300 w-full break-words ${
        isCorrect
          ? "bg-[linear-gradient(135deg,#d1fae5,#a7f3d0)] text-[#065f46] border-2 border-[#275151]"
          : "bg-[linear-gradient(135deg,#f0f9ff,#e0f2fe)] text-[#275151] border-2 border-[#63a29b]"
      }`}
    >
      <div className="text-center">
        {isCorrect ? (
          <>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">🎉</span>
              <span className="text-lg sm:text-xl font-bold">
                Excellent! That's correct!
              </span>
            </div>
            <p
              className="mt-3 sm:mt-4 text-sm sm:text-base"
              style={{ color: "#065f46" }}
            >
              You selected the right answer. Great job!
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl">❌</span>
              <span className="text-lg sm:text-xl font-bold">
                Not quite right
              </span>
            </div>
            <p
              className="mt-3 sm:mt-4 text-sm sm:text-base"
              style={{ color: "#991b1b" }}
            >
              The correct answer was: <strong>{correctAnswer}</strong>
            </p>
          </>
        )}

        <div className="flex gap-2 sm:gap-4 justify-center items-center flex-wrap mt-4 sm:mt-5">
          <button
            onClick={onRetry}
            className="bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white border-2 border-[#d97706] px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center hover:bg-[linear-gradient(135deg,#d97706,#b45309)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(245,158,11,0.3)]"
          >
            <span className="text-base sm:text-lg">🔄</span>
            <span className="hidden sm:inline">Try Again</span>
            <span className="sm:hidden">Retry</span>
          </button>
          <button
            onClick={onNext}
            className="bg-[linear-gradient(135deg,#63a29b,#275151)] text-white border-2 border-[#275151] px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[140px] justify-center hover:bg-[linear-gradient(135deg,#275151,#1a4a4a)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(99,162,155,0.4)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(99,162,155,0.3)]"
          >
            <span className="text-base sm:text-lg">→</span>
            <span className="hidden sm:inline">
              {isLastExercise ? "Complete Lesson" : "Next Exercise"}
            </span>
            <span className="sm:hidden">
              {isLastExercise ? "Complete" : "Next"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
