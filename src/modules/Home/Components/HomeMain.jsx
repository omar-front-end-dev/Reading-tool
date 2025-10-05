import { useState } from "react";
import {
  Volume2,
  Headphones,
  PenTool,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export const HomeMain = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const tools = [
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation Tool",
      titleAr: "أداة النطق",
      description:
        "Master perfect pronunciation with AI-powered feedback and real-time correction",
      descriptionAr:
        "أتقن النطق الصحيح مع تعليقات الذكاء الاصطناعي والتصحيح الفوري",
      color: "from-blue-500 to-cyan-500",
      features: ["Voice Recognition", "Accent Analysis", "Progress Tracking"],
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening Tool",
      titleAr: "أداة الاستماع",
      description:
        "Enhance your listening skills with native speakers and adaptive content",
      descriptionAr: "حسّن مهارات الاستماع مع متحدثين أصليين ومحتوى تفاعلي",
      color: "from-purple-500 to-pink-500",
      features: ["Native Audio", "Speed Control", "Comprehension Tests"],
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing Tool",
      titleAr: "أداة الكتابة",
      description:
        "Improve your writing with intelligent grammar checking and style suggestions",
      descriptionAr: "طوّر كتابتك مع فحص القواعد الذكي واقتراحات الأسلوب",
      color: "from-orange-500 to-red-500",
      features: ["Grammar Check", "Style Tips", "Vocabulary Builder"],
    },
    {
      id: 4,
      icon: BookOpen,
      title: "Reading Tool",
      titleAr: "أداة القراءة",
      description:
        "Build reading fluency with leveled content and interactive comprehension",
      descriptionAr: "ابنِ طلاقة القراءة مع محتوى متدرج وفهم تفاعلي",
      color: "from-green-500 to-teal-500",
      features: ["Adaptive Levels", "Instant Translation", "Reading Analytics"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#63a29b] via-[#275151] to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Language Learning Tools
          </h1>
          <p className="text-xl text-purple-200 arabic_font">
            أدوات احترافية لإتقان اللغة
          </p>
        </div>

        <div>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="relative group mb-6"
                onMouseEnter={() => setHoveredCard(tool.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`
                  relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 
                  border border-white/20 transition-all duration-300
                  ${
                    hoveredCard === tool.id
                      ? "transform scale-100 shadow-2xl"
                      : "shadow-xl"
                  }
                `}
                >
                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-br ${tool.color} 
                    opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300
                  `}
                  />

                  <div className="relative z-10">
                    <div
                      className={`
                      inline-flex p-4 rounded-xl bg-gradient-to-br ${
                        tool.color
                      } 
                      mb-6 transform transition-transform duration-300
                      ${hoveredCard === tool.id ? "rotate-6 scale-110" : ""}
                    `}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">
                      {tool.title}
                    </h2>
                    <p className="text-lg arabic_font text-purple-200 mb-4 font-arabic">
                      {tool.titleAr}
                    </p>

                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    <p className="text-purple-200 arabic_font mb-6 leading-relaxed font-arabic">
                      {tool.descriptionAr}
                    </p>

                    <div className="space-y-2 mb-6">
                      {tool.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-gray-300"
                        >
                          <ChevronRight className="w-4 h-4 mr-2 text-purple-400" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`
                      w-full py-3 px-6 rounded-xl font-semibold
                      bg-gradient-to-r ${tool.color}
                      text-white transform transition-all duration-300
                      hover:shadow-lg hover:scale-105
                    `}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
