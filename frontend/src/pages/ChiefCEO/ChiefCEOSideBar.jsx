import ChiefCEOSideBody from "./ChiefCEOSideBody";
import ChiefCEOSideHeader from "./ChiefCEOSideHeader";
import ResultFrameworkMenu from "./ChiefCEOComponents/ResultFrameworkMenu";
import useThemeStore from "../../store/themeStore";

function ChiefCEOSideBar({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className={`h-full p-4 fixed top-0 left-0 flex flex-col transition-all duration-300 ${
        dark
          ? "bg-[#1f2937] text-white"
          : "bg-[rgba(13,42,92,0.08)] text-gray-800"
      } shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)] scrollbar-hidden`}
      style={{ width: sidebarOpen ? "18rem" : "5rem" }}
    >
      {/* No toggle arrow here - sidebar is fixed open/closed externally */}

      {/* Show header only when open */}
      {sidebarOpen && <ChiefCEOSideHeader sidebarOpen={sidebarOpen} />}

      <div className="flex-1 overflow-y-auto mt-2 scrollbar-hidden space-y-4">
        {/* Show ResultFrameworkMenu only when open */}
        {sidebarOpen && <ResultFrameworkMenu open={sidebarOpen} />}
        <ChiefCEOSideBody open={sidebarOpen} />
      </div>
    </div>
  );
}

export default ChiefCEOSideBar;
