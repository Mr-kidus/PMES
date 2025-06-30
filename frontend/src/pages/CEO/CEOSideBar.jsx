import CEOSideBody from "./CEOSideBody";
import ResultFrameworkMenu from "./CEOComponents/ResultFrameworkMenu";
import CEOSideHeader from "./CEOSideHeader";
import useThemeStore from "../../store/themeStore";

function CEOSideBar({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className={`h-full p-4 flex flex-col transition-all duration-300 ${
        dark
          ? "bg-[#1f2937] text-white"
          : "bg-[rgba(13,42,92,0.08)] text-gray-800"
      } shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]`}
      style={{ width: sidebarOpen ? "18rem" : "5rem" }} // 72 and 20 tailwind equivalents
    >
      {/* ✅ Show header only when sidebar is open */}
      {sidebarOpen && <CEOSideHeader sidebarOpen={sidebarOpen} />}

      <div className="flex-1 overflow-y-auto mt-2 scrollbar-hidden space-y-4">
        {/* ✅ Show ResultFrameworkMenu only when sidebar is open */}
        {sidebarOpen && <ResultFrameworkMenu open={sidebarOpen} />}
        <CEOSideBody open={sidebarOpen} />
      </div>
    </div>
  );
}

export default CEOSideBar;
