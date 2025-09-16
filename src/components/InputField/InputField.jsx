import { ErrorMessage, Field } from "formik";
import { PropTypes } from "prop-types";

export const InputField = ({
  name,
  label,
  type,
  placeholder,
  icon,
  className,
  disabled = false,
}) => {
  return (
    <>
      {label && (
        <label htmlFor={name} className="block text-lg font-medium mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Field
          disabled={disabled}
          placeholder={placeholder}
          id={name}
          name={name}
          type={type}
          className={
            className +
            " " +
            "w-full px-4 py-3 focus:outline-none focus:none"
          }
        />

        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
            {icon}
          </div>
        )}
      </div>

      <ErrorMessage
        name={name}
        component="div"
        className="text-[var(--danger-color)] text-base mt-1"
      />
    </>
  );
};

InputField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  icon: PropTypes.element,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
