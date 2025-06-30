import { Outlet } from "react-router-dom";
import TopNavBar from "../../components/TopNavBar";
import ChiefCEOSideBar from "./ChiefCEOSideBar";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import { useEffect, useState } from "react";

function ChiefCEO() {
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
            : "bg-[rgba(13,42,92,0.08)] text-gray-800"
        } shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]`}
      >
        <ChiefCEOSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <TopNavBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors duration-300 ${
            dark
              ? "bg-[#1f2937] text-white"
              : "bg-[rgba(13,42,92,0.08)] text-gray-900"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ChiefCEO;
