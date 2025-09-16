import logoImage from "/assets/images/logo.png";

export const NavBar = () => {
  return (
    <nav className={`py-[15px] bg-white border-[#e5e7eb]`}>
      <div className="container container-xxl">
        <div className="flex items-center justify-center">
          <div>
            <img className="h-10" src={logoImage} alt="logo" />
          </div>
        </div>
      </div>
    </nav>
  );
};

{
  /* <NavLink
            to={"/sets"}
            className="text-sm font-medium text-[var(--main-text-color)] px-2 leading-[1.5] nav_link"
          >
            Sets
          </NavLink> */
}
