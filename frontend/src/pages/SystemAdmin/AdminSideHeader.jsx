import { IoSearch } from "react-icons/io5";
import useThemeStore from "../../store/themeStore";

function AdminSideHeader({ sidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="flex items-center gap-3 w-full mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F36F21] flex-shrink-0">
          <img src="/download.jpg" alt="MINT Logo" className="object-cover" />
        </div>
        <p className={`font-semibold ${dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"}`}>
          Ministry of Innovation & Technology
        </p>
      </div>

      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          placeholder="Search"
          className={`flex-grow rounded px-3 py-1 outline-none border transition-all ${
            dark
              ? "bg-gray-800 text-white border-gray-600 focus:border-[#F36F21]"
              : "bg-white text-[rgba(13,42,92,0.85)] border-[#F36F21] focus:border-[#F36F21]"
          }`}
        />
        <IoSearch size={24} className={`${dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"}`} />
      </div>
    </div>
  );
}

export default AdminSideHeader;
