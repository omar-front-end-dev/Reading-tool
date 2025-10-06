import { HomeNav } from "./Components/HomeNav";
import { HomeMain } from "./Components/HomeMain";
import { SideHome } from "./Components/SideHome";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-gradient-to-br from-[#63a29b] via-[#275151] to-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen w-80 z-40
            bg-gradient-to-br from-[#63a29b] via-[#275151] to-slate-900
            transform transition-transform duration-300 ease-in-out
            lg:transform-none
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
            overflow-y-auto
          `}
        >
          <SideHome />
        </aside>

        {/* Main Content */}
        <main className="flex-1 mx-auto bg-gradient-to-br from-[#63a29b] via-[#275151] to-slate-900">
          <HomeMain />
        </main>

        {/* Bottom Navigation - Mobile only */}
        <HomeNav />
      </div>
    </div>
  );
}
