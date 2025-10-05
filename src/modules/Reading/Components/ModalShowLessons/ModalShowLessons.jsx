import { useState } from "react";
import { Modal } from "../../../../components/Modal/Modal";
import PropTypes from "prop-types";
import { IoIosArrowDown } from "react-icons/io";
import { LessonList } from "../LessonList/LessonList";

export const ModalShowLessons = ({ level }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      btnText={<IoIosArrowDown />}
      btnClassName={
        "text-2xl btn-circle bg-white hover:bg-white text-black hover:scale-[1.07] btn-sm flex items-center justify-center"
      }
      classNameModalStyle={"max-w-[1050px] w-full"}
    >
      <div>
        <div>
          <div
            className="relative h-[450px] z-20 bg-[var(--primary-color)] bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${level?.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span
              className={`absolute top-0 left-0 w-full h-full z-10 bg-black bg-opacity-50`}
            ></span>

            <div className="absolute bottom-4 left-4 z-20">
              <h4 className="text-white text-3xl font-bold mb-2">
                {level?.levelTitle}
              </h4>
              <p className="text-white text-lg md:max-w-3xl">
                {level?.levelDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-3">
          <LessonList level={level} />
        </div>
      </div>
    </Modal>
  );
};

ModalShowLessons.propTypes = {
  level: PropTypes.object,
};
