import ChatPage from "./ChatPage";
import { IoClose } from "react-icons/io5";
import { useChat } from "../../context/ChatContext";
import useThemeStore from "../../store/themeStore";

export default function ChatDrawer() {
  const { showChat, setShowChat } = useChat();
  const dark = useThemeStore((s) => s.dark);
  if (!showChat) return null;

  const panelBg = dark ? "bg-gray-900 text-white" : "bg-[rgba(13,42,92,0.08)] text-[#0D2A5C]";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col sm:rounded-lg shadow-2xl overflow-hidden ${panelBg}`}>
      <div className="flex justify-between items-center p-4 bg-[#040613] text-white">
        <span className="font-bold text-lg">Chat</span>
        <button onClick={() => setShowChat(false)} aria-label="Close chat">
          <IoClose />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatPage />
      </div>
    </div>
  );
}
