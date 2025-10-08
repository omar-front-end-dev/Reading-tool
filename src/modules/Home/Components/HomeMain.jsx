import { useState } from "react";
import {
  Volume2,
  Headphones,
  PenTool,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export const HomeMain = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const tools = [
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation Tool",
      titleAr: "النطق",
      description:
        "Master perfect pronunciation with AI-powered feedback and real-time correction",
      descriptionAr:
        "أتقن النطق الصحيح مع تعليقات الذكاء الاصطناعي والتصحيح الفوري",
      color: "from-blue-500 to-cyan-500",
      features: ["Voice Recognition", "Accent Analysis", "Progress Tracking"],
      link: "/pronounce/home",
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening Tool",
      titleAr: "الاستماع",
      description:
        "Enhance your listening skills with native speakers and adaptive content",
      descriptionAr: "حسّن مهارات الاستماع مع متحدثين أصليين ومحتوى تفاعلي",
      color: "from-purple-500 to-pink-500",
      features: ["Native Audio", "Speed Control", "Comprehension Tests"],
      link: "/listening/home",
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing Tool",
      titleAr: "الكتابة",
      description:
        "Improve your writing with intelligent grammar checking and style suggestions",
      descriptionAr: "طوّر كتابتك مع فحص القواعد الذكي واقتراحات الأسلوب",
      color: "from-orange-500 to-red-500",
      features: ["Grammar Check", "Style Tips", "Vocabulary Builder"],
      link: "/reading",
    },
    {
      id: 4,
      icon: BookOpen,
      title: "Reading Tool",
      titleAr: "القراءة",
      description:
        "Build reading fluency with leveled content and interactive comprehension",
      descriptionAr: "ابنِ طلاقة القراءة مع محتوى متدرج وفهم تفاعلي",
      color: "from-green-500 to-teal-500",
      features: ["Adaptive Levels", "Instant Translation", "Reading Analytics"],
      link: "/reading",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8 pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Language Learning Tools
          </h1>
          <p className="text-lg sm:text-xl arabic_font text-gray-700 font-semibold">
            أدوات احترافية لإتقان اللغة
          </p>
        </div>

        <div>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="relative group mb-5 sm:mb-10 last:mb-0"
                onMouseEnter={() => setHoveredCard(tool.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border-2 transition-all duration-300 ${
                    hoveredCard === tool.id
                      ? "transform scale-102 shadow-2xl border-gray-300"
                      : "shadow-lg border-gray-200"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 rounded-xl sm:rounded-2xl transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${
                        tool.color
                      } mb-4 sm:mb-6 transform transition-transform duration-300 ${
                        hoveredCard === tool.id ? "scale-105" : ""
                      }`}
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {tool.title}
                    </h2>
                    <p className="text-base arabic_font sm:text-lg text-gray-700 font-semibold mb-3 sm:mb-4">
                      {tool.titleAr}
                    </p>

                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    <p className="text-sm arabic_font sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      {tool.descriptionAr}
                    </p>

                    <div className="space-y-2 mb-4 sm:mb-6">
                      {tool.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-gray-700"
                        >
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#63a29b] flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={tool.link}
                      className={`w-full block text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base bg-gradient-to-r ${tool.color} text-white transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95`}
                    >
                      Get Started
                    </Link>
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
