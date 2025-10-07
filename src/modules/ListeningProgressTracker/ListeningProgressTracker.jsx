import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Calendar,
  Home,
  List,
  Grid3X3,
  Table,
  Clock,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { SectionTitle } from "../../components";

export const ListeningProgressTracker = () => {
  const [progress, setProgress] = useState({
    progress: 0,
    completedLessons: 0,
    totalLessons: 0,
  });
  const [lessonsData, setLessonsData] = useState([]);
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "grid" | "table"


  useEffect(() => {
    try {
      const storedData = localStorage.getItem("sna-lesson-progress");
      if (storedData) {
        const lessons = JSON.parse(storedData);
        setLessonsData(lessons);

        const total = lessons.length;
        const completed = lessons.filter((lesson) => lesson.isCompleted).length;
        const totalProgress = lessons.reduce(
          (sum, lesson) => sum + lesson.progress,
          0
        );
        const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

        setProgress({
          progress: avgProgress,
          completedLessons: completed,
          totalLessons: total,
        });
      }
    } catch (error) {
      console.error("Error loading listening progress:", error);
    }
  }, []);


  const getLessonColor = (lessonId) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    return colors[(lessonId - 1) % colors.length];
  };

  // -----------------------------
  // Recent activities (unlocked or in-progress lessons)
  // -----------------------------
  const recentActivityItems = useMemo(() => {
    return lessonsData
      .filter((lesson) => lesson.isUnlocked || lesson.progress > 0)
      .sort((a, b) => b.id - a.id) // Latest first
      .map((lesson) => ({
        id: lesson.id,
        lessonTitle: `الدرس ${lesson.id}`,
        progress: lesson.progress,
        isCompleted: lesson.isCompleted,
        isUnlocked: lesson.isUnlocked,
        date: new Date().toISOString(), // Mock date - replace with real date if available
      }));
  }, [lessonsData]);

  // Group by status
  const groupedByStatus = useMemo(() => {
    const groups = {
      مكتمل: [],
      "قيد التقدم": [],
      متاح: [],
    };

    for (const item of recentActivityItems) {
      if (item.isCompleted) groups["مكتمل"].push(item);
      else if (item.progress > 0) groups["قيد التقدم"].push(item);
      else if (item.isUnlocked) groups["متاح"].push(item);
    }
    return groups;
  }, [recentActivityItems]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-[var(--main-bg-color)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <SectionTitle title={"تقدمك في الاستماع"} />
          <Link
            to="/listening/home"
            className="arabic_font inline-flex items-center text-white bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] px-4 py-2 rounded-lg transition-colors"
          >
            الرئيسية
            <Home size={20} className="ms-1" />
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="arabic_font text-xl font-semibold text-gray-800">
              الإحصائيات العامة
            </h2>
            <Headphones size={24} className="text-purple-500 ms-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {progress.completedLessons}
              </p>
              <p className="arabic_font text-gray-600">دروس مكتملة</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {progress.totalLessons}
              </p>
              <p className="arabic_font text-gray-600">إجمالي الدروس</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {progress.progress}%
              </p>
              <p className="arabic_font text-gray-600">نسبة الإكمال</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 overflow-hidden rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="arabic_font text-sm text-gray-500 mt-2 text-left">
              تقدمك العام في جميع الدروس
            </p>
          </div>
        </div>

        {/* Lessons Progress */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="arabic_font text-xl font-semibold text-gray-800">
              تقدم الدروس
            </h2>
            <Award size={24} className="text-yellow-500 ms-2" />
          </div>

          <div className="space-y-4">
            {lessonsData.length === 0 ? (
              <p className="arabic_font text-gray-500 text-center py-4">
                لا توجد دروس متاحة حتى الآن
              </p>
            ) : (
              lessonsData.map((lesson) => {
                const colorClass = getLessonColor(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            lesson.isCompleted
                              ? "bg-green-500"
                              : lesson.isUnlocked
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {lesson.id}
                        </div>
                        <div>
                          <h3 className="arabic_font font-semibold text-gray-800">
                            الدرس {lesson.id}
                          </h3>
                          <p className="arabic_font text-sm text-gray-600">
                            {lesson.isCompleted
                              ? "مكتمل"
                              : lesson.isUnlocked
                              ? "متاح"
                              : "مقفل"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-800">
                          {lesson.progress}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${colorClass} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======= Recent Activity (3 view modes) ======= */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Header */}
          <div
            className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between mb-4"
            role="tablist"
            aria-label="طرق عرض آخر النشاطات"
          >
            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode("timeline")}
                aria-pressed={viewMode === "timeline"}
                role="tab"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${
                  viewMode === "timeline"
                    ? "bg-[var(--primary-color)] text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="عرض زمني"
              >
                <List size={16} />
                <span className="hidden sm:inline">Timeline</span>
              </button>

              <button
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                role="tab"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${
                  viewMode === "grid"
                    ? "bg-[var(--primary-color)] text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="عرض كبطاقات"
              >
                <Grid3X3 size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                role="tab"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${
                  viewMode === "table"
                    ? "bg-[var(--primary-color)] text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="عرض كجدول"
              >
                <Table size={16} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Title */}
            <div className="gap-2 flex items-center text-gray-800">
              <h2 className="arabic_font text-lg md:text-xl font-semibold">
                آخر النشاطات
              </h2>
              <Calendar size={20} className="text-green-600 ms-2" />
            </div>
          </div>

          {/* Empty state */}
          {recentActivityItems.length === 0 && (
            <p className="arabic_font text-gray-500 text-center py-4">
              لا توجد نشاطات مسجلة بعد
            </p>
          )}

          {/* Timeline */}
          {viewMode === "timeline" && recentActivityItems.length > 0 && (
            <div className="relative border-s-2 border-gray-200 ps-6">
              {Object.entries(groupedByStatus).map(([statusLabel, items]) =>
                items.length > 0 ? (
                  <div key={statusLabel} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} className="text-gray-500" />
                      <h3 className="arabic_font text-gray-700 font-semibold">
                        {statusLabel}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="relative">
                          <span className="absolute -start-9 top-9 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary-color)]" />
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="font-medium text-[var(--secondary-color)] mb-1">
                                  {item.lessonTitle}
                                </p>
                                {item.isCompleted && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={14} /> مكتمل
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-2xl text-[var(--secondary-color)]">
                                  {item.progress}%
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Grid */}
          {viewMode === "grid" && recentActivityItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivityItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="arabic_font inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      {item.isCompleted ? (
                        <>
                          <CheckCircle2 size={14} /> مكتمل
                        </>
                      ) : (
                        `قيد التقدم ${item.progress}%`
                      )}
                    </span>
                  </div>

                  <p className="font-semibold text-[var(--secondary-color)] mb-3">
                    {item.lessonTitle}
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="arabic_font text-gray-700">التقدم</span>
                    <span className="font-semibold text-[var(--secondary-color)]">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table (md+); Mobile shows stacked cards */}
          {viewMode === "table" && recentActivityItems.length > 0 && (
            <>
              {/* Mobile stacked cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {recentActivityItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="arabic_font font-semibold text-[var(--secondary-color)]">
                        {item.lessonTitle}
                      </span>
                      <span className="arabic_font inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {item.progress}%
                      </span>
                    </div>
                    <p className="arabic_font text-sm text-gray-700 mb-2">
                      {item.isCompleted
                        ? "مكتمل"
                        : item.isUnlocked
                        ? "متاح"
                        : "مقفل"}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--primary-color)] text-white">
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        الدرس
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        الحالة
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        التقدم
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivityItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={idx % 2 ? "bg-gray-100" : "bg-white"}
                      >
                        <td className="arabic_font text-black text-center py-2 px-3">
                          {item.lessonTitle}
                        </td>
                        <td className="arabic_font text-black text-center py-2 px-3">
                          {item.isCompleted
                            ? "مكتمل"
                            : item.isUnlocked
                            ? "متاح"
                            : "مقفل"}
                        </td>
                        <td className="text-center py-2 px-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 mx-auto max-w-[100px]">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="arabic_font text-black text-center py-2 px-3 font-medium text-[var(--secondary-color)]">
                          {item.progress}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};