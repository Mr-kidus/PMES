import { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../../store/themeStore";

const backendUrl = "http://localhost:1221";

export default function NewMessages({ onSelectUser }) {
  const dark = useThemeStore((s) => s.dark);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    axios.get(`${backendUrl}/api/chat/recent`, { withCredentials: true }).then(res => setRecent(res.data));
  }, []);

  const wrapperBg = dark ? "bg-gray-800 border-gray-700 text-white" : "bg-[rgba(13,42,92,0.08)] border-[rgba(13,42,92,0.1)] text-[#0D2A5C]";
  const hoverBg = dark ? "hover:bg-gray-700" : "hover:bg-[#E8F0FE]";

  return (
    <div className={`p-2 border-b ${wrapperBg} text-sm`}>
      <div className="font-bold mb-2">Recent Chats</div>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {recent.map(u => (
          <div
            key={u._id}
            className={`p-2 rounded cursor-pointer ${hoverBg}`}
            onClick={() => onSelectUser(u)}
          >
            {u.fullName}
          </div>
        ))}
      </div>
    </div>
  );
}
