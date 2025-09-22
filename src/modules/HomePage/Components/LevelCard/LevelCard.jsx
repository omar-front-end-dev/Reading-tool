import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ModalShowLessons } from "../ModalShowLessons/ModalShowLessons";
import { IoNewspaperOutline, IoLockClosed } from "react-icons/io5";

export function LevelCard({ level }) {
  const getColors = (levelKey) => {
    if (levelKey === "Beginner")
      return { bg: "bg-green-400", text: "text-green-600" };
    if (levelKey === "Elementary")
      return { bg: "bg-blue-400", text: "text-blue-600" };
    if (levelKey === "Pre-Intermediate")
      return { bg: "bg-yellow-500", text: "text-yellow-700" };
    if (levelKey === "Intermediate")
      return { bg: "bg-red-500", text: "text-red-700" };
    return { bg: "bg-gray-800", text: "text-red-800" };
  };

  // تحديد ما إذا كان المستوى مقفل أم لا
  const isLocked = level?.isLocked || true;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden group block transition-transform duration-200 hover:scale-[1.02] ${isLocked ? 'opacity-75' : ''}`}>
      {/* Main Image Section */}
      <div
        className="relative h-32 bg-[var(--primary-color)] bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${level?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* أيقونة القفل - تظهر في الزاوية اليسرى العلوية */}
        {isLocked && (
          <div className="absolute top-3 left-3 z-40">
            <div className="bg-black/70 rounded-full p-2 backdrop-blur-sm">
              <IoLockClosed className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Hover Button - appears on hover */}
        <div className="absolute z-50 top-4 right-4 xl:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ModalShowLessons level={level} />
        </div>

        {/* طبقة شفافة فوق الصورة للمستويات المقفلة */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-black/60 rounded-lg px-3 py-1">
              <span className="text-white text-xs font-medium">مقفل</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      {isLocked ? (
        // إذا كان مقفل، لا يكون قابل للنقر
        <div className="block px-4 py-3 cursor-not-allowed">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            {level?.levelTitle}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gray-400 w-2 h-2 rounded-full"></div>
            <span className="text-gray-500 text-sm font-medium">
              {level?.levelKey}
            </span>
          </div>
          
          <div className="flex text-sm items-center gap-2 text-gray-500">
            <div>
              <IoLockClosed />
            </div>
            <span className="font-medium">غير متاح</span>
          </div>
        </div>
      ) : (
        // إذا لم يكن مقفل، يعمل بشكل طبيعي
        <Link
          to={`show-lesson-first-round/${level?.id}/${level?.lessons[0]?.id}`}
          className="block px-4 py-3"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            {level?.levelTitle}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <div
              className={`${getColors(level?.levelKey).bg} w-2 h-2 rounded-full`}
            ></div>
            <span
              className={`${getColors(level?.levelKey).text} text-sm font-medium`}
            >
              {level?.levelKey}
            </span>
          </div>
          <div className="flex text-sm items-center gap-2 text-gray-600">
            <div>
              <IoNewspaperOutline />
            </div>
            <span className="font-medium">{level?.lessons.length} Lessons</span>
          </div>
        </Link>
      )}
    </div>
  );
}

LevelCard.propTypes = {
  level: PropTypes.object,
};