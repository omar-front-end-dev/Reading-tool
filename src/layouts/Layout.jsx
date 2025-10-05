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
    <div className="bg-white">
      {location.pathname.includes("/reading") && (
        <>
          {location.pathname !== "/" && (
            <header>
              <NavBar />
            </header>
          )}
        </>
      )}
      <main className="min-h-[100vh]">
        <Outlet />
      </main>
    </div>
  );
}
