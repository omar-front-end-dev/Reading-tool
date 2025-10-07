

const ExerciseArea = ({
  mode,
  exercise,
  userAnswer,
  onAnswerChange,
  selectedChoice,
  onChoiceSelect,
  onSubmit,
  onReset,
  showFeedback,
}) => {
  const handleChoiceClick = (index) => {
    onChoiceSelect(index);
  };

  return (
    <div className="space-y-6">
      {/* Exercise Content */}
      {mode === "writing" && (
        <div>
          <label className="block mb-4 font-semibold text-gray-700">
            Type what you heard:
          </label>
          <textarea
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type the sentence you heard here..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-base resize-vertical min-h-[120px] font-inherit transition-colors duration-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
          />
        </div>
      )}

      {mode === "choice" && (
        <div>
          <p className="mb-5 font-semibold text-gray-700 text-center">
            Choose the correct sentence:
          </p>
          <div className="space-y-3">
            {exercise.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceClick(index)}
                className={`w-full p-4 text-left border-2 text-gray-700 rounded-xl transition-all duration-300 hover:shadow-md ${
                  selectedChoice === index
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-gray-200 bg-white hover:border-teal-300"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showFeedback && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={onSubmit}
            disabled={
              (mode === "writing" && !userAnswer.trim()) ||
              (mode === "choice" && selectedChoice === null)
            }
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              (mode === "writing" && !userAnswer.trim()) ||
              (mode === "choice" && selectedChoice === null)
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:-translate-y-1 hover:shadow-lg hover:from-teal-600 hover:to-teal-800"
            }`}
          >
            <span className="text-lg">✓</span>
            Check Answer
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-all duration-300"
          >
            <span className="text-lg">↻</span>
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseArea;
