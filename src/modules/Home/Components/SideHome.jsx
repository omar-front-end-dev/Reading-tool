import { useEffect, useMemo, useState } from "react";
import {
  Volume2,
  Headphones,
  PenTool,
  BookOpen,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { levelsAndLesson } from "../../../config/levelsAndLesson/levelsAndLesson";
import { Link } from "react-router-dom";

export const SideHome = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [progress, setProgress] = useState({});
  const [listeningProgress, setListeningProgress] = useState({
    progress: 0,
    completedLessons: 0,
    totalLessons: 10
  });

  // Load progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("quizProgress");
      const parsedProgress = savedProgress ? JSON.parse(savedProgress) : {};
      setProgress(typeof parsedProgress === "object" ? parsedProgress : {});
    } catch (error) {
      console.error("Error loading progress:", error);
      setProgress({});
    }
  }, []);

  // Load Listening progress from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('sna-lesson-progress');
      if (storedData) {
        const lessons = JSON.parse(storedData);
        const total = lessons.length;
        const completed = lessons.filter(lesson => lesson.isCompleted).length;
        const totalProgress = lessons.reduce((sum, lesson) => sum + lesson.progress, 0);
        const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;
        
        setListeningProgress({
          progress: avgProgress,
          completedLessons: completed,
          totalLessons: total
        });
      }
    } catch (error) {
      console.error('Error loading listening progress:', error);
    }
  }, []);

  // Helper functions
  const isValidProgressKey = (key) => /^level-\d+-lesson-\d+$/.test(key);

  const parseProgressKey = (key) => {
    const match = key.match(/level-(\d+)-lesson-(\d+)/);
    return match
      ? { levelId: Number(match[1]), lessonId: Number(match[2]) }
      : { levelId: null, lessonId: null };
  };

  const isKnownLesson = (levelId, lessonId) => {
    const level = levelsAndLesson.find((l) => l.id === levelId);
    return level?.lessons?.some((lesson) => lesson.id === lessonId) || false;
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const validEntries = Object.keys(progress).filter((key) => {
      if (!isValidProgressKey(key)) return false;
      const { levelId, lessonId } = parseProgressKey(key);
      return levelId && lessonId && isKnownLesson(levelId, lessonId);
    });

    const totalLessons = levelsAndLesson.reduce(
      (total, level) => total + (level.lessons?.length || 0),
      0
    );

    const completedLessons = validEntries.length;
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      completed: completedLessons,
      total: totalLessons,
      percentage,
    };
  }, [progress]);

  
  const tools = [
    {
      id: 4,
      icon: BookOpen,
      title: "Reading",
      titleAr: "القراءة",
      brief: "Adaptive level content",
      briefAr: "محتوى بمستويات متكيفة",
      progress: overallProgress.percentage,
      completedLessons: overallProgress.completed,
      totalLessons: overallProgress.total,
      color: "from-green-500 to-teal-500",
      link: "/reading/progress",
    },
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation",
      titleAr: "النطق",
      brief: "AI-powered accent training",
      briefAr: "تدريب النطق بالذكاء الاصطناعي",
      progress: 75,
      completedLessons: 15,
      totalLessons: 20,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening",
      titleAr: "الاستماع",
      brief: "Native speaker content",
      briefAr: "محتوى من متحدثين أصليين",
      progress: listeningProgress.progress,
      completedLessons: listeningProgress.completedLessons,
      totalLessons: listeningProgress.totalLessons,
      color: "from-purple-500 to-pink-500",
      link: "/listening/progress",
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing",
      titleAr: "الكتابة",
      brief: "Smart grammar correction",
      briefAr: "تصحيح القواعد الذكي",
      progress: 60,
      completedLessons: 12,
      totalLessons: 20,
      color: "from-orange-500 to-red-500",
    },
  ];

  // Calculate average progress for all tools
  const averageProgress = Math.round(
    tools.reduce((acc, tool) => acc + tool.progress, 0) / tools.length
  );

  return (
    <div className="sticky top-0 h-screen bg-gradient-to-b from-[#275151] to-[#1a3d3d] p-6 overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Learning Tools</h2>
          <p className="text-white text-sm arabic_font">أدوات التعلم</p>
        </div>

        {/* Tools Cards */}
        <div className="space-y-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeCard === tool.id;
            return (
              <Link
                to={tool.link}
                key={tool.id}
                onMouseEnter={() => setActiveCard(tool.id)}
                onMouseLeave={() => setActiveCard(null)}
                className="group cursor-pointer block w-full"
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

                  <div className="relative">
                    <div className="flex items-start gap-3 mb-3">
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
                        <p className="arabic_font text-[#63a29b] text-sm font-semibold mb-1">
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

                    {/* Progress Section */}
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`
                              h-full bg-gradient-to-r ${tool.color}
                              transition-all duration-500 ease-out
                              ${isActive ? "animate-pulse" : ""}
                            `}
                            style={{ width: `${tool.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Progress Info */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-[#63a29b]" />
                          <span className="text-white font-semibold">
                            {tool.progress}%
                          </span>
                          <span className="text-gray-400">complete</span>
                        </div>
                        <span className="text-gray-400">
                          {tool.completedLessons}/{tool.totalLessons} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="bg-gradient-to-br from-[#63a29b]/20 to-[#275151]/20 rounded-xl p-4 border border-[#63a29b]/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  Overall Progress
                </p>
                <p className="arabic_font text-[#63a29b] text-xs">
                  التقدم الإجمالي
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-2xl">
                  {averageProgress}%
                </p>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#63a29b] to-[#4d8580] transition-all duration-500"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};