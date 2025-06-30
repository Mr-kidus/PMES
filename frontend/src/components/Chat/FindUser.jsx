import { useState, useEffect } from "react";
import axios from "axios";
import useThemeStore from "../../store/themeStore";

const backendUrl = "http://localhost:1221";

export default function FindUser({ onSelectUser }) {
  const dark = useThemeStore((s) => s.dark);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState({});

  useEffect(() => {
    if (search.length >= 2) {
      axios.get(`${backendUrl}/api/users/get-users`, { withCredentials: true }).then(res => setUsers(res.data));
      axios.get(`${backendUrl}/api/chat/unread-per-user`, { withCredentials: true }).then(res => setUnread(res.data));
    } else setUsers([]);
  }, [search]);

  const filtered = users.filter(u => (u.fullName || "").toLowerCase().includes(search.toLowerCase()));
  const wrapperBg = dark ? "bg-gray-800 border-gray-700" : "bg-[rgba(13,42,92,0.08)] border-[rgba(13,42,92,0.1)]";
  const hoverBg = dark ? "hover:bg-gray-700" : "hover:bg-[#F3F6FB]";

  return (
    <div className={`p-2 border-b ${wrapperBg}`}>
      <input
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#040613]"
        placeholder="🔍 Find user..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {search.length >= 2 && (
        <div className="max-h-40 overflow-y-auto mt-2">
          {filtered.map(u => (
            <div
              key={u._id}
              className={`p-2 ${hoverBg} cursor-pointer rounded flex justify-between items-center text-sm`}
              onClick={() => onSelectUser(u)}
            >
              <span>{u.fullName}</span>
              {unread[u._id] > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 ml-2">
                  {unread[u._id]}
                </span>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-gray-400 text-center mt-2">No users found.</div>
          )}
        </div>
      )}
    </div>
  );
}
