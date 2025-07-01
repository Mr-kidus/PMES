import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { IoMdMenu } from "react-icons/io";
import { HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import ImageDropdown from "./ImageDropdown";
import useAuthStore from "../store/auth.store";
import axios from "axios";
import useThemeStore from "../store/themeStore";

function TopNavBar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const dark = useThemeStore((state) => state.dark);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`https://pmes-gimp.onrender.com/api/chat/unread`, {
        withCredentials: true,
      });
      setUnreadCount(res.data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user?._id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`https://pmes-gimp.onrender.com/api/notify/${user._id}`);
      const data = res.data || [];
      const unread = data.filter((n) => !n.isRead);
      setNotifCount(unread.length);
    } catch {
      setNotifCount(0);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, [fetchUnreadCount, fetchNotifications]);

  return (
    <header
      style={{ minHeight: "56px" }}
      className={`sticky top-0 z-40 flex justify-between items-center px-4 py-2 shadow-md transition-all duration-300 ${
        dark
          ? "bg-[#1f2937] text-white"
          : "bg-[rgba(13,42,92,0.08)] text-[rgba(13,42,92,0.85)]"
      }`}
    >
      {/* Left section */}
      <div className={`flex items-center ${sidebarOpen ? "gap-6" : "gap-4"}`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          type="button"
          className={`p-2 rounded transition-colors duration-300 ${
            dark ? "hover:bg-[#F36F21]" : "hover:bg-orange-200"
          }`}
        >
          <IoMdMenu size={24} />
        </button>

        {/* Home button */}
        <button
          onClick={() => {
            const role = user?.role?.toLowerCase();
            switch (role) {
              case "system admin":
                navigate("/admin");
                break;
              case "chief ceo":
                navigate("/chief-ceo");
                break;
              case "ceo":
                navigate("/ceo");
                break;
              case "worker":
                navigate("/worker");
                break;
              case "minister":
                navigate("/minister");
                break;
              case "strategic unit":
                navigate("/strategic");
                break;
              default:
                navigate("/");
            }
          }}
          className={`hidden lg:flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${
            dark
              ? "text-[rgba(255,255,255,0.85)] hover:text-[#F36F21]"
              : "text-[rgba(13,42,92,0.85)] hover:text-[#F36F21]"
          }`}
          aria-label="Go to Home"
        >
          <IoHomeOutline size={22} />
          {!sidebarOpen && "Home"}
        </button>

        {/* Chat button */}
        <button
          type="button"
          className={`relative hidden lg:flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${
            dark
              ? "text-[rgba(255,255,255,0.85)] hover:text-[#F36F21]"
              : "text-[rgba(13,42,92,0.85)] hover:text-[#F36F21]"
          }`}
          onClick={() => {
            const match = location.pathname.match(/^\/(admin|ceo|chief-ceo|strategic)/i);
            const basePath = match ? `/${match[1]}` : "";
            navigate(`${basePath}/chat`);
          }}
          aria-label="Go to Chat"
        >
          <HiChatBubbleLeftEllipsis size={22} />
          {!sidebarOpen && "Chat"}
          {unreadCount > 0 && (
            <span
              className="absolute -top-2 -right-3 bg-[#F36F21] text-white text-xs font-semibold rounded-full px-2 py-0.5 select-none shadow-md"
              style={{
                minWidth: "1.25rem",
                minHeight: "1.25rem",
                lineHeight: "1.25rem",
                textAlign: "center",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification button */}
        <button
          type="button"
          className={`relative hidden lg:flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${
            dark
              ? "text-[rgba(255,255,255,0.85)] hover:text-[#F36F21]"
              : "text-[rgba(13,42,92,0.85)] hover:text-[#F36F21]"
          }`}
          aria-label="Go to Notifications"
          onClick={() => {
            const match = location.pathname.match(
              /^\/(admin|ceo|chief-ceo|strategic|worker|minister)/i
            );
            const basePath = match ? `/${match[1]}` : "";
            navigate(`${basePath}/notification`);
          }}
        >
          <IoIosNotifications size={22} />
          {!sidebarOpen && "Notification"}
          {notifCount > 0 && (
            <span
              className="absolute -top-2 -right-3 bg-[#F36F21] text-white text-xs font-semibold rounded-full px-2 py-0.5 select-none shadow-md"
              style={{
                minWidth: "1.25rem",
                minHeight: "1.25rem",
                lineHeight: "1.25rem",
                textAlign: "center",
              }}
            >
              {notifCount}
            </span>
          )}
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 min-w-[150px]">
        <p
          className={`hidden lg:block truncate max-w-xs text-sm font-semibold tracking-wide ${
            dark
              ? "text-[rgba(255,255,255,0.85)]"
              : "text-[rgba(13,42,92,0.85)]"
          }`}
        >
          {user?.fullName || "No User"}
        </p>
        <ImageDropdown />
      </div>
    </header>
  );
}

export default TopNavBar;
