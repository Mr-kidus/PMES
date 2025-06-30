import { HiOutlineUserGroup } from "react-icons/hi2";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineNotificationsActive, MdAssignmentTurnedIn } from "react-icons/md";
import { FaBullseye } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import useThemeStore from "../../store/themeStore";

const sections = [
  {
    title: "Core",
    items: [
      { setting: "Dashboard", icon: <LuLayoutDashboard size={22} color="#F36F21" />, link: "dashboard" },
      { setting: "User Management", icon: <HiOutlineUserGroup size={22} color="#1e40af" />, link: "user-managment" },
      { setting: "Goal, KRA & KPI Management", icon: <FaBullseye size={22} color="#dc2626" />, link: "goal-kra-kpi-management" },
      { setting: "KPI Assignment", icon: <MdAssignmentTurnedIn size={22} color="#059669" />, link: "kpi-assign" },
    ],
  },
  {
    title: "Settings & Alerts",
    items: [
      { setting: "Configuration", icon: <IoSettingsOutline size={22} color="#374151" />, link: "configuration" },
      { setting: "Notification And Alert", icon: <MdOutlineNotificationsActive size={22} color="#ca8a04" />, link: "alert" },
      { setting: "KPI Year Assignment", icon: <MdOutlineNotificationsActive size={22} color="#ca8a04" />, link: "kpi-year-assign" },
    ],
  },
  {
    title: "Communication",
    items: [
      { setting: "Chat", icon: <BsChatDotsFill size={22} color="#2563eb" />, link: "chat" },
      { setting: "User Profile", icon: <MdOutlineNotificationsActive size={22} color="#9333ea" />, link: "user-profile" },
      { setting: "Setting", icon: <IoSettingsOutline size={22} color="#374151" />, link: "setting" },
    ],
  },
];

function AdminSideBody({ sidebarOpen }) {
  const location = useLocation();
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className="w-full h-full overflow-y-auto px-2 scrollbar-hidden"
      style={{
        paddingTop: 0,
        marginTop: 0,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {sections.map(({ title, items }) => (
        <section key={title} className="mb-6">
          {/* Remove section titles when sidebar is closed */}
          {sidebarOpen && (
            <h2
              className={`text-center font-bold uppercase text-xs tracking-wide mb-3 border-b pb-1 ${
                dark
                  ? "text-white border-white/30"
                  : "text-[rgba(13,42,92,0.85)] border-[rgba(13,42,92,0.3)]"
              }`}
            >
              {title}
            </h2>
          )}

          {/* Settings list */}
          <ul className="flex flex-col gap-2">
            {items.map(({ setting, icon, link }) => {
              const isActive = location.pathname.includes(link);

              const baseClasses = `flex items-center gap-3 px-3 py-2 rounded cursor-pointer select-none transition-colors duration-300`;

              const activeClasses = dark
                ? "bg-white/10 text-white shadow-sm"
                : "bg-[rgba(13,42,92,0.1)] text-[#0D2A5C] shadow-sm";

              const lightInactive = "hover:bg-orange-100 text-[rgba(13,42,92,0.85)]";
              const darkInactive = "hover:bg-gray-700 text-gray-300";

              return (
                <Link
                  key={setting}
                  to={link === "dashboard" ? "." : link}
                  className={`${baseClasses} ${
                    isActive ? activeClasses : dark ? darkInactive : lightInactive
                  }`}
                >
                  <span className="flex-shrink-0">{icon}</span>
                  <span
                    className={`font-medium text-xs whitespace-nowrap transition-all duration-300 ${
                      sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                    }`}
                  >
                    {setting}
                  </span>
                </Link>
              );
            })}
          </ul>
        </section>
      ))}

      <style>{`
        /* Hide scrollbar for WebKit browsers */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default AdminSideBody;
