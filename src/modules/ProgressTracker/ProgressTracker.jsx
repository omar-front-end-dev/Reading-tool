import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Award,
  Calendar,
  Home,
  List,
  Grid3X3,
  Table,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { levelsAndLesson } from "../../config/levelsAndLesson/levelsAndLesson";
import { SectionTitle } from "../../components";

/**
 * ProgressTracker.jsx
 * - Responsive + RTL friendly
 * - Robust localStorage parsing (supports unknown levels/lessons)
 * - Stats count only known catalog lessons; activity shows all
 */

export const ProgressTracker = () => {
  const [progress, setProgress] = useState({});
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "grid" | "table"

  // -----------------------------
  // Helpers for robust data handling
  // -----------------------------

  // ✅ Valid "level-<num>-lesson-<num>" key
  const isValidProgressKey = (k) => /^level-\d+-lesson-\d+$/.test(k);

  // ✅ Parse ids from key
  const parseIdsFromKey = (progressKey) => {
    const m = progressKey.match(/level-(\d+)-lesson-(\d+)/);
    return m
      ? { levelId: Number(m[1]), lessonId: Number(m[2]) }
      : { levelId: NaN, lessonId: NaN };
  };

  // ✅ Prefer ids inside value; fallback to key
  const extractIds = (progressKey, value) => {
    const fromKey = parseIdsFromKey(progressKey);
    const levelId = Number.isFinite(Number(value?.levelId))
      ? Number(value.levelId)
      : fromKey.levelId;
    const lessonId = Number.isFinite(Number(value?.lessonId))
      ? Number(value.lessonId)
      : fromKey.lessonId;
    return { levelId, lessonId };
  };

  // ✅ Resolve titles from catalog → value → placeholder
  const resolveLessonMeta = (levelId, lessonId, value) => {
    const level = levelsAndLesson.find((l) => l.id === levelId);
    const lesson = level?.lessons?.find((les) => les.id === lessonId);

    const levelTitle =
      level?.levelTitle ??
      value?.levelTitle ??
      (Number.isFinite(levelId) ? `Level ${levelId}` : "مستوى غير معروف");

    const lessonTitle =
      lesson?.title ??
      value?.lessonTitle ??
      (Number.isFinite(lessonId) ? `Lesson ${lessonId}` : "درس غير معروف");

    return { level, lesson, levelTitle, lessonTitle };
  };

  // ✅ Is this lesson present in our catalog?
  const isKnownCatalogLesson = (levelId, lessonId) => {
    const level = levelsAndLesson.find((l) => l.id === levelId);
    if (!level) return false;
    return !!level.lessons?.some((les) => les.id === lessonId);
  };

  // -----------------------------
  // Load saved progress
  // -----------------------------
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem("quizProgress");
      const saved = savedRaw ? JSON.parse(savedRaw) : {};
      setProgress(saved && typeof saved === "object" ? saved : {});
    } catch {
      setProgress({});
    }
  }, []);

  // -----------------------------
  // Date & UI helpers
  // -----------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar-EG", options);
  };

  const getLevelColor = (levelId) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-purple-500",
    ];
    // Use index if within range; default blue if out of conventional range
    return Number.isFinite(levelId)
      ? colors[(Math.max(0, levelId - 1)) % colors.length]
      : "bg-blue-500";
  };

  // -----------------------------
  // Stats: overall & per-level
  // -----------------------------
  const overallProgress = useMemo(() => {
    const validEntries = Object.entries(progress).filter(([k, v]) => {
      if (!isValidProgressKey(k)) return false;
      const { levelId, lessonId } = extractIds(k, v);
      return isKnownCatalogLesson(levelId, lessonId);
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

    return { completed: completedLessons, total: totalLessons, percentage };
  }, [progress]);

  const getLevelProgress = (levelId) => {
    const level = levelsAndLesson.find((l) => l.id === levelId);
    if (!level) return { completed: 0, total: 0, percentage: 0, level: null };

    const completed = Object.entries(progress).filter(([k, v]) => {
      if (!isValidProgressKey(k)) return false;
      const ids = extractIds(k, v);
      return (
        ids.levelId === levelId && isKnownCatalogLesson(ids.levelId, ids.lessonId)
      );
    }).length;

    const total = level.lessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage, level };
  };

  // Only levels that have at least one known completed lesson
  const levelsWithProgress = useMemo(() => {
    return levelsAndLesson.filter(
      (level) => getLevelProgress(level.id).completed > 0
    );
  }, [progress]);

  // -----------------------------
  // Recent activities (show all, including unknowns)
  // -----------------------------
  const recentActivityItems = useMemo(() => {
    return Object.entries(progress)
      .filter(([k, v]) => isValidProgressKey(k) && v && v.date)
      .sort(([, a], [, b]) => new Date(b.date) - new Date(a.date))
      .slice(0, 20)
      .map(([progressKey, data]) => {
        const { levelId, lessonId } = extractIds(progressKey, data);
        const { levelTitle, lessonTitle } = resolveLessonMeta(
          levelId,
          lessonId,
          data
        );
        const pct =
          data?.total > 0 ? Math.round((data.score / data.total) * 100) : 0;

        return {
          id: progressKey,
          levelId,
          lessonId,
          levelTitle,
          lessonTitle,
          date: data.date,
          score: data.score,
          total: data.total,
          pct,
          isKnown: isKnownCatalogLesson(levelId, lessonId),
        };
      });
  }, [progress]);

  // Group by "today / yesterday / date"
  const groupedByDay = useMemo(() => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    for (const item of recentActivityItems) {
      const d = new Date(item.date);
      let key = formatDate(item.date);
      if (isSameDay(d, today)) key = "اليوم";
      else if (isSameDay(d, yesterday)) key = "أمس";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
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
        <div className="flex items-center justify-between">
          <SectionTitle title={"تقدمك في التعلم"} />
          <Link
            to="/"
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
            <BarChart3 size={24} className="text-blue-500 ms-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {overallProgress.completed}
              </p>
              <p className="arabic_font text-gray-600">دروس مكتملة</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {overallProgress.total}
              </p>
              <p className="arabic_font text-gray-600">إجمالي الدروس</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {overallProgress.percentage}%
              </p>
              <p className="arabic_font text-gray-600">نسبة الإكمال</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 overflow-hidden rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${overallProgress.percentage}%` }}
              />
            </div>
            <p className="arabic_font text-sm text-gray-500 mt-2 text-left">
              تقدمك العام في جميع المستويات
            </p>
          </div>
        </div>

        {/* Level Progress (only those with progress) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="arabic_font text-xl font-semibold text-gray-800">
              تقدم المستويات
            </h2>
            <Award size={24} className="text-yellow-500 ms-2" />
          </div>

          <div className="space-y-6">
            {levelsWithProgress.length === 0 ? (
              <p className="arabic_font text-gray-500 text-center py-4">
                لا توجد مستويات ذات تقدّم حتى الآن
              </p>
            ) : (
              levelsWithProgress.map((level) => {
                const levelProgress = getLevelProgress(level.id);
                const colorClass = getLevelColor(level.id);
                return (
                  <div
                    key={level.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          {level.levelTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {level.levelKey} - {level.levelDescription}
                        </p>
                      </div>
                      <div className="text-sm flex flex-col items-end text-gray-800 text-right w-24">
                        <span>
                          {levelProgress.completed}/{levelProgress.total}
                        </span>
                        <span className="arabic_font text-xs">دروس</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`${colorClass} h-3 rounded-full transition-all duration-1000`}
                        style={{ width: `${levelProgress.percentage}%` }}
                      />
                    </div>
                    <p className="text-md text-gray-800 text-left">
                      {levelProgress.percentage}% مكتمل
                    </p>
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
              {Object.entries(groupedByDay).map(([dayLabel, items]) => (
                <div key={dayLabel} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-gray-500" />
                    <h3 className="arabic_font text-gray-700 font-semibold">
                      {dayLabel}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="relative">
                        <span className="absolute -start-9 top-9 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary-color)]" />
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--secondary-color)] mb-1 truncate">
                                {item.levelTitle} — {item.lessonTitle}
                              </p>
                              <p className="arabic_font text-sm text-gray-600">
                                {formatDate(item.date)}
                              </p>
                              {!item.isKnown && (
                                <span className="mt-1 inline-block arabic_font text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  خارج الكتالوج
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-[var(--secondary-color)]">
                                {item.score}/{item.total}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.pct}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-[var(--primary-color)]"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                    <span className="arabic_font inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={14} /> مكتمل {item.pct}%
                    </span>
                    <span className="arabic_font text-xs text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <p className="font-semibold text-[var(--secondary-color)] mb-1 truncate">
                    {item.levelTitle}
                  </p>
                  <p className="text-sm text-gray-700 mb-2 truncate">
                    {item.lessonTitle}
                  </p>

                  {!item.isKnown && (
                    <span className="arabic_font text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-block mb-2">
                      خارج الكتالوج
                    </span>
                  )}

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-[var(--primary-color)]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="arabic_font text-gray-700">النتيجة</span>
                    <span className="font-semibold text-[var(--secondary-color)]">
                      {item.score}/{item.total}
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
                      <span className="arabic_font text-xs text-gray-500">
                        {formatDate(item.date)}
                      </span>
                      <span className="arabic_font inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={14} /> {item.pct}%
                      </span>
                    </div>
                    <p className="font-semibold text-[var(--secondary-color)] truncate">
                      {item.levelTitle}
                    </p>
                    <p className="text-sm text-gray-700 mb-2 truncate">
                      {item.lessonTitle}
                    </p>
                    {!item.isKnown && (
                      <span className="arabic_font text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-block mb-2">
                        خارج الكتالوج
                      </span>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="arabic_font text-gray-700">النتيجة</span>
                      <span className="font-semibold text-[var(--secondary-color)]">
                        {item.score}/{item.total}
                      </span>
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
                        التاريخ
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        المستوى
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        الدرس
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        النتيجة
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
                        <td className="arabic_font text-black text-center py-2 px-3 whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>
                        <td className="arabic_font text-black text-center py-2 px-3">
                          {item.levelTitle}
                        </td>
                        <td className="arabic_font text-black text-center py-2 px-3">
                          {item.lessonTitle}
                        </td>
                        <td className="arabic_font text-black text-center py-2 px-3 font-medium text-[var(--secondary-color)]">
                          {item.score}/{item.total}
                        </td>
                        <td className="arabic_font text-black text-center py-2 px-3">
                          {item.pct}%
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
