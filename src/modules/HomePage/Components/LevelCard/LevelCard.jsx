import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ModalShowLessons } from "../ModalShowLessons/ModalShowLessons";
import { IoNewspaperOutline } from "react-icons/io5";

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
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group block transition-transform duration-200 hover:scale-[1.02]">
      {/* Main Image Section */}
      <div
        className="relative h-32 bg-[var(--primary-color)] bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${level?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Hover Button - appears on hover */}
        <div className="absolute z-50 top-4 right-4 xl:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ModalShowLessons level={level} />
        </div>
      </div>

      {/* Content Section */}
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
    </div>
  );
}

LevelCard.propTypes = {
  level: PropTypes.object,
};
