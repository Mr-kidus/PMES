import { HiOutlineUsers } from "react-icons/hi2";
import { MdPendingActions } from "react-icons/md";
import { PiWarningCircleLight } from "react-icons/pi";
import { TbActivityHeartbeat } from "react-icons/tb";
import useThemeStore from "../../store/themeStore";

function AdminInfo() {
  const dark = useThemeStore((state) => state.dark);
  const cardData = [
    {
      title: "Active Users",
      icon: <HiOutlineUsers size={28} />,
      value: 234,
      subtitle: "+12 from last month",
    },
    {
      title: "Pending Approval",
      icon: <MdPendingActions size={28} />,
      value: 12,
      subtitle: "+3 from last month",
    },
    {
      title: "Overdue Reports",
      icon: <PiWarningCircleLight size={30} />,
      value: 7,
      subtitle: "+1 from last month",
    },
    {
      title: "System Health",
      icon: <TbActivityHeartbeat size={30} />,
      value: "99.8%",
      subtitle: "Stable",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cardData.map(({ title, icon, value, subtitle }) => (
        <div
          key={title}
          className={`p-4 rounded shadow flex flex-col justify-between ${
            dark ? "bg-[#1f2937]" : "bg-[rgba(13,42,92,0.08)]"
          }`}
        >
          <div
            className={`flex justify-between items-center mb-2 ${
              dark ? "text-[#F9FAFB]" : "text-[rgba(13,42,92,0.85)]"
            }`}
          >
            <h3 className="font-semibold text-lg">{title}</h3>
            <span className="text-[#F36F21]">{icon}</span>
          </div>
          <h2
            className={`text-3xl font-bold mb-1 ${
              dark ? "text-[#F9FAFB]" : "text-[rgba(13,42,92,0.85)]"
            }`}
          >
            {value}
          </h2>
          <p className={`text-sm ${dark ? "text-[#D1D5DB]" : "text-[rgba(13,42,92,0.65)]"}`}>
            {subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AdminInfo;
