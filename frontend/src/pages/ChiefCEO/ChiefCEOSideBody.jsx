import { ChevronDown } from "lucide-react";
import useChiefCEOSideMenuTitles from "./ChiefCEOSideMenuTitles"; // updated import
import { useState } from "react";
import { Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";

function ChiefCEOSideBody({ open }) {
  const dark = useThemeStore((state) => state.dark);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});
  const [isSubSubMenuOpen, setSubSubMenuOpen] = useState({});
  const [userData] = useState({ sector: "Innovation and research" });

  const Datas = useChiefCEOSideMenuTitles(); // get dynamic menu data with sector id link

  const toggleDropdown = (key) => {
    setIsSubMenuOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSubSubMenu = (subIndex) => {
    setSubSubMenuOpen((prev) => ({
      ...prev,
      [subIndex]: !prev[subIndex],
    }));
  };

  return (
    <div className={`text-sm h-full overflow-y-auto ${open ? "px-2" : "px-0"} scrollbar-hidden`}>
      <ul className="space-y-1">
        {Datas.map((data, index) => (
          <div key={index}>
            {/* Section Title with HR */}
            {data.sectionTitle && (
              <div
                className={`border-t pt-4 flex items-center ${
                  open ? "justify-between" : "justify-center"
                } ${dark ? "text-white font-bold" : "text-[rgba(13,42,92,0.85)] font-bold"}`}
              >
                <h1 className={`${!open ? "hidden" : "uppercase text-xs tracking-wide"}`}>
                  {data.sectionTitle}
                </h1>
                <span>{data.icon}</span>
              </div>
            )}

            {/* Main Menu Item */}
            <Link to={data.link || "#"}>
              <li
                className={`flex gap-2 px-2 py-1 items-center rounded cursor-pointer transition duration-300 mt-2 ${
                  dark ? "text-white hover:bg-gray-700" : "text-[rgba(13,42,92,0.85)] hover:bg-orange-100"
                } ${!open ? "justify-center" : ""}`}
                onClick={(e) => {
                  if (data.submenu) {
                    e.preventDefault();
                    toggleDropdown(data.key);
                  }
                }}
              >
                <span className={`${open ? "" : "text-[16px]"}`}>{data.icon || "•"}</span>
                <span className={`${!open ? "hidden" : "font-bold text-xs whitespace-nowrap"}`}>
                  {typeof data.menu === "string" ? data.menu : data.menu[0]}
                </span>
                {data.submenu && open && (
                  <ChevronDown
                    className={`transition-transform ${isSubMenuOpen[data.key] ? "rotate-180" : ""}`}
                    size={15}
                  />
                )}
              </li>
            </Link>

            {/* Submenu */}
            {data.subMenuItems && isSubMenuOpen[data.key] && open && (
              <div className="py-3 flex flex-col gap-2 ml-4">
                {data.subMenuItems
                  .filter((sec) => sec.subMenuItem === userData.sector)
                  .map((item, subIndex) => (
                    <div key={subIndex}>
                      <Link to={item.link || "#"}>
                        <li className="py-1 flex justify-between px-2 text-white/80 rounded cursor-pointer bg-green-200/10 hover:bg-green-300/20">
                          {item.subMenuItem}
                          <ChevronDown
                            className={`transition-transform duration-200 ${
                              isSubSubMenuOpen[subIndex] ? "rotate-180" : ""
                            }`}
                            onClick={() => toggleSubSubMenu(subIndex)}
                            size={15}
                          />
                        </li>
                      </Link>

                      {item.subsubmenu && isSubSubMenuOpen[subIndex] && (
                        <ul className="ml-4 mt-2 text-xs flex flex-col gap-2">
                          {item.subsubMenus.map((subsubmenu) => (
                            <li
                              key={subsubmenu}
                              className="px-2 py-1 rounded bg-green-600 text-white"
                            >
                              {subsubmenu}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </ul>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

export default ChiefCEOSideBody;
