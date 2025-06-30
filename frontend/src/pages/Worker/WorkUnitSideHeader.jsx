import { IoSearch } from "react-icons/io5";
import useThemeStore from "../../store/themeStore";

function WorkUnitSideHeader({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      
      <h2 className={`text-lg font-bold mb-4 text-center transition-opacity ${
        !sidebarOpen ? "opacity-0 pointer-events-none" : ""
      } ${dark ? "text-white" : "text-gray-900"}`}>
        Ministry of Innovation & Technology
      </h2>

      <div className="flex items-center gap-3 w-full mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-300">
          <img src="/download.jpg" alt="logo" className="object-cover" />
        </div>
        <p className={`font-semibold transition-opacity ${
          !sidebarOpen ? "opacity-0 pointer-events-none" : ""
        } ${dark ? "text-white" : "text-gray-800"}`}>
          የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር
        </p>
      </div>

      <div className={`flex items-center gap-2 w-full ${!sidebarOpen ? "hidden" : ""}`}>
        <input
          type="text"
          placeholder="Search"
          className={`flex-grow rounded px-3 py-1 outline-none border transition-all ${
            dark
              ? "bg-gray-800 text-white border-gray-600 focus:border-orange-500"
              : "bg-white text-gray-900 border-orange-400 focus:border-orange-600"
          }`}
        />
        <IoSearch size={24} className={`${dark ? "text-white" : "text-gray-800"}`} />
      </div>
    </div>
  );
}

export default WorkUnitSideHeader;
