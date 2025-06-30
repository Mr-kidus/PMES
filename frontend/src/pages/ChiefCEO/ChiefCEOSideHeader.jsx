// ChiefCEOSideHeader.jsx
import { IoSearch } from "react-icons/io5";
import useThemeStore from "../../store/themeStore";

function ChiefCEOSideHeader({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <h2
        className={`text-lg text-center font-bold mb-6 transition-opacity duration-300 ${
          !sidebarOpen ? "opacity-0 pointer-events-none" : ""
        } ${dark ? "text-white" : "text-gray-900"}`}
      >
        Minister of Innovation & Technology
      </h2>

      <div
        className={`flex gap-4 mb-6 items-center w-full ${
          !sidebarOpen ? "justify-center" : ""
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-amber-200 text-center overflow-hidden flex-shrink-0">
          <img src="/download.jpg" alt="logo" className="object-cover" />
        </div>
        {sidebarOpen && (
          <p
            className={`font-semibold transition-opacity duration-300 ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር
          </p>
        )}
      </div>

      {sidebarOpen && (
        <div className="flex gap-4 w-full items-center">
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
      )}
    </div>
  );
}

export default ChiefCEOSideHeader;
