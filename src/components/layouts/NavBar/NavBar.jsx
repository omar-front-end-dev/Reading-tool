import { Link } from "react-router-dom";
import logoImage from "/assets/images/logo.png";

export const NavBar = () => {
  return (
    <>
      <header className="flex bg-white items-center justify-center px-4 md:px-6 py-3 md:py-4 border-b-[1px] border-[var(--primary-color)]-1/20">
        <Link to="/" className="w-48">
          <img className="w-full" src={logoImage} alt="logo" />
        </Link>
      </header>
    </>
  );
};
