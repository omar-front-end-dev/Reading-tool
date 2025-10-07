import React, { useState } from "react";

const ListeningPhase = ({ lesson, onComplete }) => {
  const [isWatching, setIsWatching] = useState(false);

  const dailyTips = [
    "Watch the video at least twice - once for general understanding, then again for details!",
    "Take breaks between exercises to let your brain process what you've learned.",
    "Don't be afraid to replay difficult sentences multiple times - repetition builds skill!",
    "Focus on understanding the meaning first, then worry about perfect spelling.",
    "Practice with different accents and speaking speeds to improve your adaptability.",
    "Keep a vocabulary journal of new words you encounter during practice.",
    "Try to predict what comes next in a sentence - this improves your language intuition.",
  ];

  const today = new Date().getDate();
  const tipIndex = today % dailyTips.length;
  const dailyTip = dailyTips[tipIndex];

  const handleStartWatching = () => {
    setIsWatching(true);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="text-center max-w-[800px] mx-auto">
      <h2 className="text-4xl text-[#275151] mb-4">🎶 Listening Phase</h2>
      <p className="text-[#475569] mb-6 text-lg">
        Watch the video below to improve your listening skills
      </p>

      {/* Tip of the Day */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 my-6 flex items-center gap-3 text-left">
        <span className="text-2xl flex-shrink-0">🌟</span>
        <div className="text-[#334155] text-sm leading-relaxed">
          <strong>Tip of the Day:</strong> {dailyTip}
        </div>
      </div>

      {/* YouTube Video */}
      <div className="relative w-full h-0 pb-[56.25%] my-6 rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <iframe
          src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
          title="SNA Academy Listening Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-none"
        />
      </div>

      <p className="text-[#475569] my-6 text-base">
        After watching the video, click "Next" to proceed to the dictation phase
      </p>

      <button
        onClick={handleComplete}
        className="bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-[background-color] duration-300 hover:bg-[linear-gradient(45deg,#275151,#63a29b)] hover:-translate-y-[2px]"
      >
        Next - Dictation Phase
      </button>
    </div>
  );
};

export default ListeningPhase;
