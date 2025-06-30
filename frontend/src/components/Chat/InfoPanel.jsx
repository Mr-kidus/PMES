import useThemeStore from "../../store/themeStore";

export default function InfoPanel({ user, group }) {
  const dark = useThemeStore((s) => s.dark);
  const bg = dark ? "bg-gray-800 text-white" : "bg-[rgba(13,42,92,0.08)] text-[#0D2A5C]";
  const textGray = dark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`p-4 text-sm h-full ${bg}`}>
      {user && (
        <>
          <div className="font-bold text-lg text-[#040613] mb-1">{user.fullName}</div>
          <div className={textGray}>{user.email}</div>
        </>
      )}
      {group && (
        <>
          <div className="font-bold text-lg text-[#040613] mb-1">{group.name}</div>
          <div className={textGray}>{group.members.length} members</div>
        </>
      )}
      {!user && !group && (
        <div className="text-gray-400 text-sm">Select a user or group to start chatting.</div>
      )}
    </div>
  );
}
