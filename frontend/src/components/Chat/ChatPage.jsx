import { useState } from "react";
import useThemeStore from "../../store/themeStore";
import FindUser from "./FindUser";
import ChatWindow from "./ChatWindow";
import NewMessages from "./NewMessages";
import InfoPanel from "./InfoPanel";
import GroupChat from "./GroupChat";

export default function ChatPage() {
  const dark = useThemeStore((s) => s.dark);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  const sidebarBg = dark ? "bg-gray-800 border-gray-700" : "bg-[rgba(13,42,92,0.08)] border-[rgba(13,42,92,0.1)]";

  return (
    <div className={`flex flex-col md:flex-row h-full w-full ${dark ? "text-white" : "text-[#0D2A5C]"}`}>
      {/* Sidebar */}
      <div className={`w-full md:w-1/4 border-r ${sidebarBg} flex flex-col overflow-y-auto`}>
        <FindUser onSelectUser={handleSelectUser} />
        <NewMessages onSelectUser={handleSelectUser} />
        <GroupChat onSelectGroup={handleSelectGroup} selectedGroup={selectedGroup} />
      </div>

      {/* Chat Window */}
      <div className={`${dark ? "bg-gray-900" : "bg-white"} flex-1 overflow-hidden flex flex-col`}>
        <ChatWindow user={selectedUser} group={selectedGroup} />
      </div>

      {/* Info panel */}
      <div className={`hidden md:block md:w-1/4 border-l ${sidebarBg} overflow-y-auto`}>
        <InfoPanel user={selectedUser} group={selectedGroup} />
      </div>
    </div>
  );
}
