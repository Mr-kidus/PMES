import { useEffect, useState } from "react";
import useThemeStore from "../../store/themeStore";
import TopNavBar from "../../components/TopNavBar";
import AdminSideBar from "./AdminSideBar";
import { Outlet } from "react-router-dom";

function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dark = useThemeStore((state) => state.dark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-72" : "w-20"
        } ${
          dark
            ? "bg-[#1f2937] text-white shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]"
            : "bg-[rgba(13,42,92,0.08)] text-gray-800 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]"
        }`}
      >
        <AdminSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Main content */}
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

export default Admin;
