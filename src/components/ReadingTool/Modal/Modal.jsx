import { memo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { MdClose } from "react-icons/md";
import styles from "./Modal.module.css";

export const Modal = memo(
  ({
    children,
    btnClassName,
    btnText,
    isOpen,
    setIsOpen,
    classNameModalStyle,
  }) => {
    const closeModal = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          closeModal();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [closeModal]);
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    const modalContent = (
      <>
        {isOpen && (
          <div
            className={`fixed inset-0 z-50 bg-black bg-opacity-50 ${styles.animate_fade_in} ${styles.modal_container}`}
            onClick={closeModal}
          >
            <div
              className={`
               text-black absolute ${styles.modal_box} ${
                styles.animate_slide_up
              } ${classNameModalStyle || "px-4 py-5"}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#fdfdfd",
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                className={`rounded-full z-50 p-1 text-3xl btn-ghost absolute right-4 top-4 hover:text-black bg-white hover:bg-white`}
              >
                <MdClose />
              </button>
              <div>{children}</div>
            </div>
          </div>
        )}
      </>
    );

    return (
      <>
        <button
          type="button"
          className={btnClassName}
          onClick={() => setIsOpen(true)}
        >
          {btnText}
        </button>
        {typeof document !== "undefined" &&
          createPortal(modalContent, document.body)}
      </>
    );
  }
);

Modal.displayName = "Modal";

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  children: PropTypes.node,
  btnClassName: PropTypes.string,
  classNameModalStyle: PropTypes.string,
  btnText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.node,
  ]),
};
