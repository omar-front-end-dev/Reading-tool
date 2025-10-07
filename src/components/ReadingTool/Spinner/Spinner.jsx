import { PropTypes } from "prop-types";

export const Spinner = ({ size = "xs" }) => {
  return <span className={`loading loading-spinner flex loading-${size}`} />;
};

Spinner.propTypes = {
  size: PropTypes.string,
};
