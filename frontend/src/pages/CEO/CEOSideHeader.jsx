import { IoSearch } from "react-icons/io5";
import useThemeStore from "../../store/themeStore";

function CEOSideHeader({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div className="flex flex-col items-center justify-center mb-6">
    

      <div
        className={`flex items-center gap-3 w-full mb-6 ${
          !sidebarOpen ? "justify-center" : ""
        }`}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-300 flex-shrink-0">
          <img src="/download.jpg" alt="logo" className="object-cover" />
        </div>
        <p
          className={`font-semibold transition-opacity ${
            !sidebarOpen ? "opacity-0 pointer-events-none" : ""
          } ${dark ? "text-white" : "text-gray-800"}`}
        >
          Ministry of Innovation & Technology
        </p>
      </div>

      <div
        className={`flex items-center gap-2 w-full ${
          !sidebarOpen ? "hidden" : ""
        }`}
      >
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

export default CEOSideHeader;
