import { ChevronDown } from "lucide-react";
import Datas from "./MinisterSideMenuTitles";
import { useState } from "react";
import { Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";

function MinisterSideBody({ open }) {
  const dark = useThemeStore((state) => state.dark);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});

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
            {/* Section Title with HR */}
            {data.sectionTitle && (
              <div
                className={`flex items-center border-t pt-4 ${
                  open ? "justify-between" : "justify-center"
                } ${dark ? "text-white font-bold" : "text-[rgba(13,42,92,0.85)] font-bold"}`}
              >
                <h1 className={`${!open ? "hidden" : "uppercase text-xs tracking-wide"}`}>
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
                {/* Icon */}
                {data.icon && (
                  <span className={`${open ? "" : "text-[16px]"}`}>
                    {data.icon}
                  </span>
                )}

                {/* Menu Label */}
                <span
                  className={`font-medium text-xs ${
                    !open ? "hidden" : ""
                  } whitespace-nowrap`}
                >
                  {data.menu}
                </span>

                {/* Dropdown Arrow */}
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

            {/* Submenu Items (Optional - if needed in future) */}
            {data.subMenuItems && isSubMenuOpen[data.key] && open && (
              <ul className="ml-4 mt-1 flex flex-col gap-1 text-xs">
                {data.subMenuItems.map((item, idx) => (
                  <li key={idx} className="px-2 py-1 rounded">
                    <Link
                      to={item.link || "#"}
                      className={`block rounded transition-colors duration-200 ${
                        dark ? "text-white hover:bg-gray-700" : "text-gray-800 hover:bg-orange-100"
                      }`}
                    >
                      {item.subMenuItem}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </ul>

      {/* Hide WebKit scrollbar */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default MinisterSideBody;
