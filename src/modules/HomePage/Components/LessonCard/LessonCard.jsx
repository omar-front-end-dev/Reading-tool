import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const LessonCard = ({
  lesson,
  levelKey,
  levelId,
  index,
  levelImage,
}) => {
  return (
    <Link
      to={`show-lesson-first-round/${levelId}/${lesson.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex md:items-center flex-col md:flex-row items-start gap-4">
        {/* Image with overlay number */}
        <div className="relative flex-shrink-0 w-full md:w-auto">
          <img
            src={levelImage}
            alt={lesson?.title}
            className="w-full md:w-32 md:h-32 h-48 rounded-xl object-cover"
          />
          {/* Number circle overlay */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div
              className="w-20 h-20 rounded-full text-[#f8b400] flex items-center justify-center text-4xl font-bold shadow-lg"
              style={{
                background: "linear-gradient(135deg, #63a29bd6, #275151f0)",
              }}
            >
              {index + 1}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {lesson?.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{lesson?.description}</p>

          {/* Stats bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-600 text-sm font-medium">
              {levelKey}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

LessonCard.propTypes = {
  lesson: PropTypes.object,
  levelKey: PropTypes.string,
  levelId: PropTypes.number,
  index: PropTypes.number,
  levelImage: PropTypes.string,
};
