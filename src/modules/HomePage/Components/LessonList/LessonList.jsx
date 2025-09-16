import PropTypes from "prop-types";
import { LessonCard } from "../LessonCard/LessonCard";

export const LessonList = ({ level }) => {
  return (
    <div className="space-y-4">
      {level?.lessons.map((lesson, index) => (
        <LessonCard
          key={index}
          index={index}
          levelImage={level?.image}
          lesson={lesson}
          levelKey={level?.levelKey}
          levelId={level?.id}
        />
      ))}
    </div>
  );
};
LessonList.propTypes = {
  level: PropTypes.array,
};
