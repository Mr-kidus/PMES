import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { LuFrame } from "react-icons/lu";
import { Link } from "react-router-dom";
import useAuthStore from "../../../store/auth.store";
import useThemeStore from "../../../store/themeStore";

const backendUrl = "http://localhost:1221";

const ResultFrameworkMenu = ({ open = true }) => {
  const { user } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);

  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSectors, setOpenSectors] = useState({});

  const role = (user?.role || "").toLowerCase();
  const userSectorId = user?.sector?._id || user?.sector;
  const userSubsectorId = user?.subsector?._id || user?.subsector;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/menu/result-framework`);
        const fullData = Array.isArray(res.data) ? res.data : [];

        let filteredData = [];

        if (role === "chief ceo") {
          filteredData = fullData.filter(sector => sector._id === userSectorId);
        } else if (role === "ceo" || role === "worker") {
          filteredData = fullData
            .map(sector => {
              const matchingSubsectors = sector.subsectors?.filter(
                sub => sub._id === userSubsectorId
              );
              return matchingSubsectors?.length
                ? { ...sector, subsectors: matchingSubsectors }
                : null;
            })
            .filter(Boolean);
        } else {
          filteredData = fullData;
        }

        setMenuData(filteredData);
      } catch (err) {
        console.error(err);
        setError("Error loading menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [role, userSectorId, userSubsectorId]);

  const toggleSector = (sectorId) => {
    setOpenSectors(prev => ({
      ...prev,
      [sectorId]: !prev[sectorId],
    }));
  };

  if (loading)
    return (
      <div className="p-4 text-xs" style={{ color: dark ? "white" : "black" }}>
        Loading menu...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-xs text-red-500">
        {error}
      </div>
    );

  // Use fixed base path for strategic unit
  const basePath = "/strategic";

  return (
    <div
      className={`${
        open ? "px-4" : "px-2"
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
      {/* Header */}
      <div
        className={`flex items-center border-b pb-2 mt-4 ${
          open ? "justify-between" : "justify-center"
        } ${dark ? "border-white/30" : "border-[rgba(13,42,92,0.3)]"}`}
      >
        {open && (
          <div className="flex items-center gap-2">
            <LuFrame size={20} className="text-[#F36F21]" />
            <h2 className="text-sm font-semibold">Result Framework</h2>
          </div>
        )}
      </div>

      {/* Menu List */}
      <ul className="mt-3 space-y-1">
        {menuData.length === 0 && (
          <li className={`px-2 text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
            No sectors available.
          </li>
        )}

        {menuData.map((sector) => (
          <li key={sector._id} className="rounded overflow-hidden">
            <div
              className={`flex items-center cursor-pointer rounded duration-300 select-none ${
                dark
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-[rgba(255,165,0,0.1)] hover:bg-[rgba(255,165,0,0.2)]"
              }`}
            >
              <Link
                to={`${basePath}/allSector/${sector._id}?userId=${user._id}`}
                className={`flex-1 px-3 py-2 text-xs no-underline ${
                  dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"
                }`}
              >
                {sector.name}
              </Link>

              {sector.subsectors && sector.subsectors.length > 0 && (
                <button
                  className="px-2 py-2 focus:outline-none"
                  onClick={() => toggleSector(sector._id)}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"
                    } ${openSectors[sector._id] ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>

            {/* Subsector list */}
            {sector.subsectors && openSectors[sector._id] && (
              <ul
                className={`ml-5 mt-1 flex flex-col gap-1 ${
                  dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"
                }`}
              >
                {sector.subsectors.map(subsector => (
                  <li key={subsector._id}>
                    <Link
                      to={`${basePath}/allSubsector/${subsector._id}?userId=${user._id}`}
                      className={`block px-3 py-1 rounded text-xs transition duration-300 ${
                        dark
                          ? "bg-white/10 hover:bg-white/20"
                          : "bg-[rgba(255,165,0,0.1)] hover:bg-[rgba(255,165,0,0.2)]"
                      }`}
                    >
                      {subsector.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Hide Webkit Scrollbar */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ResultFrameworkMenu;
