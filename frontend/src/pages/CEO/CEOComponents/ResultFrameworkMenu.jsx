import { useEffect, useState } from "react";
import axios from "axios";
import { LuFrame } from "react-icons/lu";
import { Link } from "react-router-dom";
import useAuthStore from "../../../store/auth.store";
import useThemeStore from "../../../store/themeStore";

const backendUrl = "http://localhost:1221";

const ResultFrameworkMenu = ({ open = true }) => {
  const { user } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);

  const role = (user?.role || "").toLowerCase();
  const userSectorId = user?.sector?._id || user?.sector;
  const userSubsectorId = user?.subsector?._id || user?.subsector;

  const [subsectors, setSubsectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubsectors = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/subsector/get-subsector`);
        let list = Array.isArray(res.data) ? res.data : [];

        if (role === "chief ceo") {
          list = list.filter(
            (sub) => sub?.sectorId === userSectorId || sub?.sectorId?._id === userSectorId
          );
        } else if (role === "ceo" || role === "worker") {
          list = list.filter((sub) => sub?._id === userSubsectorId);
        }

        setSubsectors(list);
      } catch (err) {
        console.error("Failed to fetch subsectors:", err);
        setError("Error loading subsectors.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubsectors();
  }, [role, userSectorId, userSubsectorId]);

  // Generate base path dynamically from role:
  const basePath = role ? `/${role}` : "";

  return (
    <div
      className={`${
        open ? "px-4" : "px-0"
      } text-sm rounded transition-all duration-300 overflow-y-auto scrollbar-hidden ${
        dark
          ? "bg-[#1f2937] text-white"
          : "bg-[rgba(13,42,92,0.08)] text-[rgba(13,42,92,0.85)]"
      }`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        maxHeight: "calc(100vh - 100px)",
      }}
    >
      <div
        className={`flex items-center border-b pb-2 mb-4 ${
          dark ? "border-white/30" : "border-[rgba(13,42,92,0.3)]"
        } ${open ? "justify-between" : "justify-center"}`}
      >
        {open && (
          <div className="flex items-center gap-2">
            <LuFrame size={23} className="text-[#F36F21]" />
            <h2
              className={`text-sm font-semibold ${
                dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"
              }`}
            >
              Result Framework
            </h2>
          </div>
        )}
      </div>

      {loading && <div className="p-2 text-xs">Loading subsectors...</div>}
      {error && <div className="text-red-400 p-2 text-xs">{error}</div>}

      {!loading && !error && (
        <ul className="space-y-2">
          {subsectors.length === 0 ? (
            <li className="text-gray-500 text-xs">No subsectors available.</li>
          ) : (
            subsectors.map((subsector) => (
              <li key={subsector._id}>
                <Link
                  to={`${basePath}/allSubsector/${subsector._id}?userId=${user._id}`}
                  className={`block px-3 py-2 rounded text-xs transition duration-300 ${
                    dark
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-[rgba(255,165,0,0.1)] text-[rgba(13,42,92,0.85)] hover:bg-[rgba(255,165,0,0.2)]"
                  }`}
                >
                  {subsector.subsector_name || subsector.name}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ResultFrameworkMenu;
