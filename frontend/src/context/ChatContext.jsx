import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ChatContext = createContext();
const SOCKET_URL = "http://localhost:1221";

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch unread count on mount
    const fetchUnread = async () => {
      try {
        const res = await axios.get("http://localhost:1221/api/chat/unread", { withCredentials: true });
        setUnreadCount(res.data.count || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, []);

  useEffect(() => {
    let userId;
    axios.get("http://localhost:1221/api/users/get-profile", { withCredentials: true })
      .then(res => {
        userId = res.data._id;
        socketRef.current = io(SOCKET_URL, { withCredentials: true });
        socketRef.current.emit("identify", userId);

        socketRef.current.on("messageNotification", () => {
          setUnreadCount((c) => c + 1);
        });
      });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (showChat) setUnreadCount(0);
  }, [showChat]);

  return (
    <ChatContext.Provider value={{ showChat, setShowChat, unreadCount, setUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}