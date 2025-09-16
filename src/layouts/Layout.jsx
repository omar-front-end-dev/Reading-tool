import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../components";
import { useEffect } from "react";

export function Layout() {
  const location = useLocation();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <div className="bg-[var(--main-bg-color)]">
      <header>
        <NavBar />
      </header>
      {/* className="min-h-[calc(100vh-52px)]" */}
      <main className="min-h-[100vh]">
        <Outlet />
      </main>
    </div>
  );
}
