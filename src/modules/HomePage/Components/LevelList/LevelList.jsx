import { LevelCard } from "../LevelCard/LevelCard";
import PropTypes from "prop-types";

export const LevelList = ({ levelList }) => {
  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-4">
        {levelList.map((level) => (
          <LevelCard key={level.id} level={level} />
        ))}
      </div>
    </>
  );
};

LevelList.propTypes = {
  levelList: PropTypes.array,
};
