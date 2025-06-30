import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";
import useCEOSideMenuTitles from "./CEOSideMenuTitles.jsx"; // <-- dynamic menu with user ID and subsector ID

function CEOSideBody({ open }) {
  const dark = useThemeStore((state) => state.dark);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});
  const Datas = useCEOSideMenuTitles();

  const toggleDropdown = (key) => {
    setIsSubMenuOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="text-sm h-full overflow-y-auto px-2 scrollbar-hidden">
      <ul className="space-y-1">
        {Datas.map((data, index) => (
          <div key={index}>
            {/* Section Title with Icon */}
            {data.sectionTitle && (
              <div
                className={`border-t pt-4 flex items-center ${
                  open ? "justify-between" : "justify-center"
                } ${dark ? "text-white font-bold" : "text-[rgba(13,42,92,0.85)] font-bold"}`}
              >
                <h1
                  className={`${
                    !open ? "hidden" : "uppercase text-xs tracking-wide"
                  }`}
                >
                  {data.sectionTitle}
                </h1>
                <span>{data.icon}</span>
              </div>
            )}

            {/* Menu Item */}
            <Link to={data.link || "#"}>
              <li
                className={`flex gap-2 px-2 py-1 items-center rounded cursor-pointer transition duration-300 mt-2 ${
                  dark
                    ? "text-white hover:bg-gray-700"
                    : "text-[rgba(13,42,92,0.85)] hover:bg-orange-100"
                } ${!open ? "justify-center" : ""}`}
                onClick={(e) => {
                  if (data.submenu) {
                    e.preventDefault();
                    toggleDropdown(data.key);
                  }
                }}
              >
                {data.icon && (
                  <span className={`${open ? "" : "text-[16px]"}`}>
                    {data.icon}
                  </span>
                )}
                <span
                  className={`font-medium text-xs ${
                    !open ? "hidden" : ""
                  } whitespace-nowrap`}
                >
                  {data.menu}
                </span>
                {data.submenu && open && (
                  <ChevronDown
                    className={`transition-transform ${
                      isSubMenuOpen[data.key] ? "rotate-180" : ""
                    }`}
                    size={15}
                  />
                )}
              </li>
            </Link>
          </div>
        ))}
      </ul>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

export default CEOSideBody;
