import WorkUnitSideBody from "./WorkUnitSideBody";
import WorkUnitSideHeader from "./WorkUnitSideHeader";
import useThemeStore from "../../store/themeStore";

function WorkUnitSideBar({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className={`h-full p-4 flex flex-col transition-colors duration-300 ${
        dark
          ? "bg-[#1f2937] text-white"
          : "bg-[rgba(13,42,92,0.08)] text-gray-800"
      } shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]`}
      style={{ width: sidebarOpen ? "18rem" : "5rem" }} // 72 and 20 in tailwind
    >
      {/* ✅ Show only when sidebar is open */}
      {sidebarOpen && <WorkUnitSideHeader sidebarOpen={sidebarOpen} />}

      <div className="flex-1 overflow-y-auto mt-2 scrollbar-hidden space-y-4">
        
        <WorkUnitSideBody open={sidebarOpen} />
      </div>
    </div>
  );
}

export default WorkUnitSideBar;
