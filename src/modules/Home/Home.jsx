import { useState } from "react";
import { Trophy, Star, Lock } from "lucide-react";
import { HomeNav } from "./Components/HomeNav";
import { HomeMain } from "./Components/HomeMain";
import { SideHome } from "./Components/SideHome";

export function Home() {
  const [xp, setXp] = useState(10);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="flex">
        {/* Left Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block w-80 ">
          <SideHome />
        </aside>

        {/* Main Content */}
        <main className="flex-1 mx-auto">
          <HomeMain />
        </main>

        <HomeNav />
      </div>
    </div>
  );
}
