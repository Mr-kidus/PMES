import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, CheckCircle, FolderOpen } from "lucide-react";
import useAuthStore from "../store/auth.store";
import useThemeStore from "../store/themeStore";

const backendUrl = "https://pmes-gimp.onrender.com";

function NotificationCard() {
  const { user } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);

  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [showRead, setShowRead] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/notify/${user._id}`);
        const data = res.data;
        if (Array.isArray(data)) {
          setNotifications(data.filter(n => !n.isRead));
          setReadNotifications(data.filter(n => n.isRead));
        } else {
          setNotifications([]);
          setReadNotifications([]);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchNotifications();
  }, [user?._id]);

  const markAllAsRead = async () => {
    try {
      await axios.put(`${backendUrl}/api/notify/mark-all-read/${user._id}`);
      setReadNotifications(prev => [...prev, ...notifications]);
      setNotifications([]);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      await axios.put(`${backendUrl}/api/notify/mark-read/${id}`);
      const note = notifications.find(n => n._id === id);
      if (note) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        setReadNotifications((prev) => [...prev, { ...note, isRead: true }]);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const activeNotifications = showRead ? readNotifications : notifications;

  return (
    <div
      className={`max-w-5xl mx-auto p-4 rounded-xl border shadow-md
        text-sm font-normal
        ${dark
          ? "bg-[#1f2937] border-gray-700 text-white"
          : "bg-[rgba(13,42,92,0.08)] border-orange-100 text-[rgba(13,42,92,0.85)]"
        }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" /> {showRead ? "Read Notifications" : "Unread Notifications"}
        </h2>
        <button
          onClick={() => setShowRead(!showRead)}
          className={`text-xs font-medium flex items-center gap-1 rounded px-2 py-1
            ${dark ? "hover:bg-gray-800" : "hover:bg-orange-200"}
          `}
        >
          <FolderOpen className="w-4 h-4" />
          {showRead ? "Show Unread" : "View Read"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading notifications...</div>
      ) : activeNotifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No {showRead ? "read" : "unread"} notifications found.</div>
      ) : (
        activeNotifications.map((note) => (
          <div
            key={note._id}
            className={`relative border-t first:border-none py-3 px-2 group
              ${dark ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex justify-between text-[11px] text-gray-400 mb-0.5">
              <span className="font-bold text-orange-400">{note.module}</span>
              <span>{new Date(note.createdAt).toLocaleString()}</span>
            </div>

            <p className="font-semibold text-sm mb-0.5">{note.title}</p>
            <p className="text-xs mb-1">{note.message}</p>

            <div className="text-xs text-indigo-600 font-medium">
              {note.isRead ? (
                <span className="flex items-center gap-1 text-gray-400">
                  <CheckCircle className="w-3 h-3" /> Read
                </span>
              ) : (
                <button
                  className="hover:underline"
                  onClick={() => markOneAsRead(note._id)}
                >
                  Mark as Read
                </button>
              )}
            </div>

            {!note.isRead && (
              <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 rounded-r-lg" />
            )}
          </div>
        ))
      )}

      {!loading && !showRead && notifications.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={markAllAsRead}
            className="text-indigo-700 dark:text-[#F36F21] font-medium hover:underline text-xs flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-4 h-4" /> Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationCard;
