import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import useThemeStore from "../../store/themeStore";

import useWorkunitSideMenuTitles from "./WorkUnitSideMenuTitles";

function WorkUnitSideBody({ open }) {
  const dark = useThemeStore((state) => state.dark);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState({});
  const sections = useWorkunitSideMenuTitles();

  const toggleDropdown = (key) => {
    setIsSubMenuOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="text-sm h-full overflow-y-auto px-2 scrollbar-hidden">
      <ul className="space-y-1">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Header */}
            {section.sectionTitle && (
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
                  {section.sectionTitle}
                </h1>
                <span>{section.sectionIcon}</span>
              </div>
            )}

            {/* Menu Items */}
            {section.items.map((item, itemIndex) => (
              <Link to={item.link || "#"} key={item.key || itemIndex}>
                <li
                  className={`flex gap-2 px-2 py-1 items-center rounded cursor-pointer transition duration-300 mt-2 ${
                    dark
                      ? "text-white hover:bg-gray-700"
                      : "text-[rgba(13,42,92,0.85)] hover:bg-orange-100"
                  } ${!open ? "justify-center" : ""}`}
                  onClick={(e) => {
                    if (item.submenu) {
                      e.preventDefault();
                      toggleDropdown(item.key);
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span
                    className={`font-medium text-xs ${
                      !open ? "hidden" : ""
                    } whitespace-nowrap`}
                  >
                    {item.menu}
                  </span>
                  {item.submenu && open && (
                    <ChevronDown
                      className={`transition-transform ${
                        isSubMenuOpen[item.key] ? "rotate-180" : ""
                      }`}
                      size={15}
                    />
                  )}
                </li>
              </Link>
            ))}
          </div>
        ))}
      </ul>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

export default WorkUnitSideBody;
