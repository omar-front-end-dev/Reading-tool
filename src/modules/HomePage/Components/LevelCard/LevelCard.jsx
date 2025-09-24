import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ModalShowLessons } from "../ModalShowLessons/ModalShowLessons";
import { IoNewspaperOutline, IoLockClosed, IoPlay } from "react-icons/io5";

export function LevelCard({ level }) {
  const getColors = (levelKey) => {
    if (levelKey === "Beginner")
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-700",
        gradient: "from-emerald-400 to-teal-500",
        icon: "🌱",
      };
    if (levelKey === "Elementary")
      return {
        bg: "bg-blue-500",
        text: "text-blue-700",
        gradient: "from-blue-400 to-indigo-500",
        icon: "📚",
      };
    if (levelKey === "Pre-Intermediate")
      return {
        bg: "bg-amber-500",
        text: "text-amber-700",
        gradient: "from-amber-400 to-orange-500",
        icon: "⚡",
      };
    if (levelKey === "Intermediate")
      return {
        bg: "bg-red-500",
        text: "text-red-700",
        gradient: "from-red-400 to-rose-500",
        icon: "🔥",
      };
    if (levelKey === "Upper-Intermediate")
      return {
        bg: "bg-purple-600",
        text: "text-purple-700",
        gradient: "from-purple-500 to-violet-600",
        icon: "💎",
      };
    if (levelKey === "Advanced")
      return {
        bg: "bg-gradient-to-r from-pink-500 to-rose-600",
        text: "text-rose-800",
        gradient: "from-pink-500 via-rose-500 to-red-600",
        icon: "👑",
      };
    return {
      bg: "bg-slate-500",
      text: "text-slate-700",
      gradient: "from-slate-400 to-gray-500",
      icon: "📖",
    };
  };

  
  const isLocked = level?.isLocked || false;
  const colors = getColors(level?.levelKey);

  return (
    <div
      className={`relative bg-white rounded-3xl shadow-xl overflow-hidden group block transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] ${
        isLocked ? "opacity-80" : ""
      }`}
    >
      {/* Main Image Section with Gradient Overlay */}
      <div
        className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200"
        style={{
          backgroundImage: `url(${level?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-20`}
        ></div>

        {/* Lock Icon - Premium Design */}
        {isLocked && (
          <div className="absolute top-4 left-4 z-50 animate-pulse">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-40"></div>
              {/* Lock Container */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-3 border border-gray-700/50 backdrop-blur-sm">
                <IoLockClosed className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Premium Badge for Locked Content */}
        {isLocked && (
          <div className="absolute top-4 right-4 z-40">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg">
              ⭐ PREMIUM
            </div>
          </div>
        )}

        {/* Play Button for Unlocked Content */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-sm">
            <div className="bg-white/90 rounded-full w-12 h-12 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <IoPlay className="text-gray-800 text-2xl ml-1" />
            </div>
          </div>
        )}

        {/* Hover Button */}
        {!isLocked && (
          <div className="absolute z-50 top-4 right-4 xl:opacity-0 group-hover:opacity-100 transition-all duration-300 transform xl:translate-y-2 group-hover:translate-y-0">
            <ModalShowLessons level={level} />
          </div>
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-4">
            <div className="bg-black/80 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
              <span className="arabic_font text-white text-sm font-medium flex items-center gap-2">
                <IoLockClosed className="w-4 h-4" />
                اشترك للوصول
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section with Enhanced Design */}
      {isLocked ? (
        <div className="relative p-3 cursor-not-allowed">
          {/* Premium Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-orange-50 opacity-30"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-bold text-gray-600 leading-tight">
                {level?.levelTitle}
              </h3>
              <div className="text-yellow-500">
                <IoLockClosed className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 w-3 h-3 rounded-full shadow-sm"></div>
              <span className="text-gray-500 text-sm font-semibold flex items-center gap-1">
                <span className="text-base">{colors.icon}</span>
                {level?.levelKey}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex text-sm items-center gap-2 text-gray-500">
                <IoLockClosed className="" />
                <span className="font-medium arabic_font">اشترك للوصول</span>
              </div>

              {/* <button className="arabic_font bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:shadow-lg transition-all duration-300 hover:scale-105">
                فتح
              </button> */}
            </div>
          </div>
        </div>
      ) : (
        <Link
          to={`show-lesson-first-round/${level?.id}/${level?.lessons[0]?.id}`}
          className="block px-3 py-3 group/link"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 leading-tight group-hover/link:text-gray-700 transition-colors">
              {level?.levelTitle}
            </h3>
            <div className="text-gray-400 group-hover/link:text-gray-600 transition-colors">
              <IoPlay className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div
              className={`${colors.bg} w-3 h-3 rounded-full shadow-lg animate-pulse`}
            ></div>
            <span
              className={`${colors.text} text-sm font-bold tracking-wide flex items-center gap-2`}
            >
              <span className="text-lg">{colors.icon}</span>
              {level?.levelKey}
            </span>
          </div>

          <div className="flex text-sm items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="bg-gray-100 p-1.5 rounded-lg">
                <IoNewspaperOutline className="w-4 h-4" />
              </div>
              <span className="font-semibold arabic_font">
                {level?.lessons?.length || 0} دروس
              </span>
            </div>

            <div className="arabic_font text-xs text-gray-400 font-medium">
              ابدأ التعلم ←
            </div>
          </div>
        </Link>
      )}

      {/* Bottom Accent Line */}
      <div
        className={`h-1 w-full absolute bottom-0 left-0 bg-gradient-to-r ${
          colors.gradient
        } ${isLocked ? "opacity-30" : ""}`}
      ></div>
    </div>
  );
}

LevelCard.propTypes = {
  level: PropTypes.object,
};
