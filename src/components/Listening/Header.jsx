import { Link } from "react-router-dom";
import logoImage from "/assets/images/logo.png";
const Header = ({ onToggleTips }) => {
  return (
    <div className="bg-white shadow-[0_4px_20px_rgba(99,162,155,0.1)] border-b border-[rgba(99,162,155,0.1)] sticky top-0 z-[1020] backdrop-blur-[10px]">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-[1px]">
           <Link to="/" className="w-48">
          <img className="w-full" src={logoImage} alt="logo" />
        </Link>
        </div>
        <button
          className="flex items-center gap-1 sm:gap-2 bg-[linear-gradient(45deg,#63a29b,#275151)] text-white border-none px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(99,162,155,0.3)] relative overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(99,162,155,0.4)] hover:bg-[linear-gradient(45deg,#275151,#63a29b)] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] before:transition-[left] before:duration-[0.6s] before:ease-in-out hover:before:left-full"
          onClick={onToggleTips}
        >
          <span className="text-base sm:text-lg relative z-10">💡</span>
          <span className="text-xs sm:text-sm relative z-10">Tips & Help</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
