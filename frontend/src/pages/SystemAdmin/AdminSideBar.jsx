import AdminSideHeader from "./AdminSideHeader";
import AdminSideBody from "./AdminSideBody";
import useThemeStore from "../../store/themeStore";

function AdminSideBar({ sidebarOpen, setSidebarOpen }) {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className={`h-full flex flex-col p-4 overflow-y-auto scrollbar-hide transition-colors ${
        dark
          ? "bg-[#1f2937] text-white shadow-lg"
          : "bg-[rgba(13,42,92,0.1)] text-[rgba(13,42,92,0.85)] shadow-sm"
      }`}
    >
      {/* Remove header entirely when sidebar is closed */}
      {sidebarOpen && <AdminSideHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

      <AdminSideBody sidebarOpen={sidebarOpen} />
    </div>
  );
}

export default AdminSideBar;
