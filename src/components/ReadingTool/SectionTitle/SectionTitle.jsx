import PropTypes from "prop-types";

export const SectionTitle = ({ title }) => {
  return (
    <div className="my-6">
      <h2
        className="relative inline-block text-lg md:text-2xl font-bold text-black mb-1
               before:content-[''] before:absolute before:left-0 before:-bottom-2
               before:w-full before:h-[3px]
               before:bg-gradient-to-r before:from-[var(--secondary-color)] before:to-[var(--primary-color)]
               before:rounded-2xl arabic_font"
      >
        {title}
      </h2>
    </div>
  );
};

SectionTitle.propTypes = {
  title: PropTypes.string,
};
