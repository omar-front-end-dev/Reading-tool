import React from "react";

const MobileProgressBar = ({
  totalSentences,
  currentSentenceIndex,
  completedSentences,
}) => {
  const progressPercentage = Math.round(
    (completedSentences.size / totalSentences) * 100
  );

  return (
    <div className="mobile-progress-bar">
      <div className={`progress-bullets progress-${progressPercentage}`}>
        {Array.from({ length: totalSentences }, (_, index) => {
          let className = "progress-bullet";

          if (completedSentences.has(index)) {
            className += " completed";
          } else if (index === currentSentenceIndex) {
            className += " active";
          } else {
            className += " inactive";
          }

          return (
            <div
              key={index}
              className={className}
              data-sentence-index={index}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MobileProgressBar;


