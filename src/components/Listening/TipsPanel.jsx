import { useState } from "react";
import dataService from "../../services/dataService";

const TipsPanel = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("listening");

  if (!isOpen) return null;

  const categories = [
    { id: "listening", name: "Listening", icon: "🎧" },
    { id: "writing", name: "Writing", icon: "✏️" },
    { id: "general", name: "General", icon: "📚" },
  ];

  const currentTips = dataService.getTipsDatabase()[activeCategory] || [];

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[1050] flex items-center justify-center ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      } transition-all duration-300`}
    >
      <div
        className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-[4px]"
        onClick={onClose}
      ></div>
      <div
        className={`relative bg-white rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] max-w-[600px] w-[90%] max-h-[80vh] overflow-hidden transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-90 translate-y-[20px]"
        }`}
      >
        <div className="flex items-center justify-between p-6 bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white">
          <h3 className="flex items-center gap-3 text-2xl font-bold m-0">
            <span className="text-3xl">💡</span>
            Learning Tips
          </h3>
          <button
            className="bg-[rgba(255,255,255,0.2)] border-none text-white text-2xl w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-[rgba(255,255,255,0.3)] hover:scale-110"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6 max-h-[calc(80vh-100px)] overflow-y-auto">
          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 bg-[#f8fafc] border-2 border-[rgba(99,162,155,0.2)] rounded-xl px-4 py-3 cursor-pointer transition-all duration-300 font-semibold text-[#334155] hover:bg-[rgba(99,162,155,0.1)] hover:border-[rgba(99,162,155,0.4)] hover:-translate-y-1 ${
                  activeCategory === category.id
                    ? "bg-[linear-gradient(135deg,#63a29b_0%,#275151_100%)] text-white border-[#63a29b] shadow-[0_4px_15px_rgba(99,162,155,0.3)]"
                    : ""
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {currentTips.map((tip, index) => (
              <div
                key={index}
                className="bg-[#f8fafc] border border-[rgba(99,162,155,0.1)] rounded-xl p-5 transition-all duration-300 hover:bg-[rgba(99,162,155,0.05)] hover:border-[rgba(99,162,155,0.2)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <span className="font-bold text-[#275151] text-lg">
                    {tip.title}
                  </span>
                </div>
                <div className="text-[#334155] leading-relaxed text-sm">
                  {tip.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipsPanel;
