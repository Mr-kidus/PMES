import { Outlet } from "react-router-dom";
import WorkUnitSideBar from "./WorkUnitSideBar";
import TopNavBar from "../../components/TopNavBar";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import { useEffect, useState } from "react";

function Worker() {
  const user = useAuthStore((state) => state.user);
  const dark = useThemeStore((state) => state.dark);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <div
        className={`h-full transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-20"
        } ${
          dark
            ? "bg-[#1f2937] text-white"
            : "bg-[rgba(13,42,92,0.08)] text-gray-800" // subtle navy blue 8% opacity
        } shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]`}
      >
        <WorkUnitSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <TopNavBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-8 ${
            dark
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-900 shadow-[inset_8px_0_12px_-8px_rgba(13,42,92,0.15)]"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Worker;
