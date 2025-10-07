import React from "react";
import "./SpinnerLoadingIcon.css";

const SpinnerLoadingIcon = ({
  size = 90,
  color = "#63a29b",
  dotColor = "#ffffff",
  className = "",
  ariaLabel = "Processing your recording...",
}) => {
  return (
    <div
      className={`spinner-loading-container ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="spinner-circle" style={{ borderColor: color }}>
        <div className="spinner-dots">
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
          <div
            className="spinner-dot"
            style={{ backgroundColor: dotColor }}
          ></div>
        </div>
      </div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default SpinnerLoadingIcon;
