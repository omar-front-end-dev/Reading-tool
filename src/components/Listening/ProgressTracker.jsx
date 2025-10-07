import React from "react";

const ProgressTracker = ({ current, total, stats }) => {
  const progressPercentage = (current / total) * 100;

  return (
    <div className="flex justify-center gap-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="text-center">
        <div className="text-2xl font-bold text-teal-600 mb-1">
          {stats.correct}
        </div>
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Correct
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {stats.total}
        </div>
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Total
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {stats.accuracy}%
        </div>
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Accuracy
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
