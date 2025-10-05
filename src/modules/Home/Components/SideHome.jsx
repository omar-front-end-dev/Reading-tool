import { useState } from "react";
import {
  Volume2,
  Headphones,
  PenTool,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export const SideHome = () => {
  const [activeCard, setActiveCard] = useState(null);

  const tools = [
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation",
      titleAr: "النطق",
      brief: "AI-powered accent training",
      briefAr: "تدريب النطق بالذكاء الاصطناعي",
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening",
      titleAr: "الاستماع",
      brief: "Native speaker content",
      briefAr: "محتوى من متحدثين أصليين",
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing",
      titleAr: "الكتابة",
      brief: "Smart grammar correction",
      briefAr: "تصحيح القواعد الذكي",
    },
    {
      id: 4,
      icon: BookOpen,
      title: "Reading",
      titleAr: "القراءة",
      brief: "Adaptive level content",
      briefAr: "محتوى بمستويات متكيفة",
    },
  ];

  return (
    <div className="sticky top-0 h-screen bg-gradient-to-b from-[#275151] to-[#1a3d3d] p-6 overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Learning Tools
          </h2>
          <p className="text-[#63a29b] text-sm">أدوات التعلم</p>
        </div>

        {/* Tools Cards */}
        <div className="space-y-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeCard === tool.id;

            return (
              <div
                key={tool.id}
                onMouseEnter={() => setActiveCard(tool.id)}
                onMouseLeave={() => setActiveCard(null)}
                className="group cursor-pointer"
              >
                <div
                  className={`
                  relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 
                  border border-white/10 transition-all duration-300
                  ${
                    isActive
                      ? "bg-white/10 border-[#63a29b]/50 shadow-lg"
                      : "hover:bg-white/8"
                  }
                `}
                >
                  {/* Glow effect */}
                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-r from-[#63a29b]/20 to-[#275151]/20
                    rounded-2xl transition-opacity duration-300
                    ${isActive ? "opacity-100" : "opacity-0"}
                  `}
                  />

                  <div className="relative flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`
                      w-12 h-12 rounded-xl bg-gradient-to-br from-[#63a29b] to-[#4d8580]
                      flex items-center justify-center flex-shrink-0
                      transition-transform duration-300
                      ${isActive ? "scale-110" : "scale-100"}
                    `}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base mb-1">
                        {tool.title}
                      </h3>
                      <p className="text-[#63a29b] text-sm font-semibold mb-2">
                        {tool.titleAr}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {tool.brief}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className={`
                      w-5 h-5 text-[#63a29b] flex-shrink-0 mt-1
                      transition-all duration-300
                      ${
                        isActive
                          ? "opacity-100 translate-x-1"
                          : "opacity-0 translate-x-0"
                      }
                    `}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="bg-gradient-to-br from-[#63a29b]/20 to-[#275151]/20 rounded-xl p-4 border border-[#63a29b]/30">
            <p className="text-white font-semibold text-sm mb-2">
              Start Learning Today
            </p>
            <p className="text-[#63a29b] text-xs">
              ابدأ رحلتك التعليمية الآن
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};