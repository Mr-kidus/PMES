import StrategicSideHeader from "./StrategicSideHeader";
import StrategicSideBody from "./StrategicSideBody";
import ResultFrameworkMenu from "./StrategicComponents/ResultFrameworkMenu";
import useThemeStore from "../../store/themeStore";

function StrategicSideBar({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className={`h-full p-4 flex flex-col transition-all duration-300 ${
        dark
          ? "bg-[#1f2937] text-white"
          : "bg-[rgba(13,42,92,0.08)] text-gray-800"
      } shadow-[2px_0_8px_-2px_rgba(0,0,0,0.15)]`}
      style={{ width: sidebarOpen ? "18rem" : "5rem" }}
    >
      {sidebarOpen && <StrategicSideHeader sidebarOpen={sidebarOpen} />}

      <div className="flex-1 overflow-y-auto mt-2 scrollbar-hidden space-y-4">
        {sidebarOpen && <ResultFrameworkMenu open={sidebarOpen} />}
        <StrategicSideBody open={sidebarOpen} />
      </div>
    </div>
  );
}

export default StrategicSideBar;
