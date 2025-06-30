import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineSearch } from "react-icons/md";
import { transformAssignedKpisToNested } from "../../utils/transformAssignedKpisToNested";
import KPIGroupedTableReport from "../Table/KPIGroupedTableReport";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";

const BACKEND_URL = "http://localhost:1221";

function AllSectorReport() {
  const { user } = useAuthStore();
  const { dark } = useThemeStore();

  const role = user?.role?.toLowerCase() || "";

  // Filters
  const [filterSector, setFilterSector] = useState("");
  const [filterSubsector, setFilterSubsector] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");

  // Dropdown data
  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [filteredSubsectors, setFilteredSubsectors] = useState([]);

  // KPI data states
  const [assignedKpisRaw, setAssignedKpisRaw] = useState(null);
  const [nestedKpis, setNestedKpis] = useState([]);
  const [detailedKpis, setDetailedKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default sector if Chief CEO
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [sectorRes, subsectorRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/sector/get-sector`),
          axios.get(`${BACKEND_URL}/api/subsector/get-subsector`),
        ]);
        const allSectors = sectorRes.data?.data || [];
        setSubsectors(subsectorRes.data || []);

        if (role === "chief ceo") {
          const mySector = allSectors.find((s) => s._id === user?.sectorId || user?.sector?._id);
          if (mySector) {
            setFilterSector(mySector._id);
            setSectors([mySector]); // Only show their own
          } else {
            setSectors([]); // fallback
          }
        } else {
          setSectors(allSectors);
        }
      } catch (err) {
        console.error("Failed to fetch sectors/subsectors:", err);
      }
    }
    fetchDropdownData();
  }, [role, user]);

  // Filter subsectors based on selected sector
  useEffect(() => {
    if (!filterSector) {
      setFilteredSubsectors([]);
      setFilterSubsector("");
      return;
    }
    const filtered = subsectors.filter((sub) => {
      const sectorIdFromSub =
        typeof sub.sectorId === "object" ? sub.sectorId._id || sub.sectorId : sub.sectorId;
      return sectorIdFromSub === filterSector;
    });
    setFilteredSubsectors(filtered);

    if (!filtered.find((sub) => sub._id === filterSubsector)) {
      setFilterSubsector("");
    }
  }, [filterSector, subsectors, filterSubsector]);

  const inputClasses = `
    w-full md:w-52 px-3 py-2 rounded-md border text-sm transition focus:outline-none focus:ring-2
    ${dark
      ? "bg-[#1f2937] text-white border-gray-600 placeholder-gray-400 focus:ring-[#F36F21]"
      : "bg-white text-[rgba(13,42,92,0.85)] border border-gray-300 placeholder-gray-500 focus:ring-[#0D2A5C]"
    }
  `;

  const labelClasses = `text-xs font-medium mb-1 ${
    dark ? "text-gray-300" : "text-[rgba(13,42,92,0.8)]"
  }`;

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = 2015; y <= currentYear + 1; y++) {
    yearOptions.push(y.toString());
  }

  const quarters = ["All", "Q1", "Q2", "Q3", "Q4"];

  const showSector = !(role === "worker" || role === "ceo");
  const showSubsector = !(role === "worker" || role === "ceo");

  const handleLoadKpis = async () => {
    let sectorToUse = showSector ? filterSector : "";
    let subsectorToUse = showSubsector ? filterSubsector : "";

    if (!sectorToUse && !subsectorToUse) {
      setError("Please select a sector or subsector to load KPIs.");
      setNestedKpis([]);
      setDetailedKpis([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let assignedData = [];

      if (subsectorToUse) {
        const assignedRes = await axios.get(
          `${BACKEND_URL}/api/assign/assigned-kpi-with-goal-details/${subsectorToUse}`,
          { headers: { Accept: "application/json" } }
        );
        assignedData = assignedRes.data;

        setAssignedKpisRaw(assignedData);
        setNestedKpis(transformAssignedKpisToNested(assignedData));

        const detailedRes = await axios.get(
          `${BACKEND_URL}/api/assign/details/by-subsector/${subsectorToUse}`,
          { headers: { Accept: "application/json" } }
        );
        setDetailedKpis(detailedRes.data || []);
      } else if (sectorToUse) {
        const assignedRes = await axios.get(
          `${BACKEND_URL}/api/assign/sector/${sectorToUse}`,
          { headers: { Accept: "application/json" } }
        );
        assignedData = assignedRes.data;
        setAssignedKpisRaw(assignedData);
        setNestedKpis(transformAssignedKpisToNested(assignedData));

        const kpiIds = assignedData
          .map((item) => item.kpi_id || (item.kpi && item.kpi.kpi_id))
          .filter(Boolean);

        if (kpiIds.length === 0) {
          setDetailedKpis([]);
        } else {
          const idsQuery = kpiIds.join(",");
          const detailedRes = await axios.get(
            `${BACKEND_URL}/api/assign/details?ids=${idsQuery}`,
            { headers: { Accept: "application/json" } }
          );
          setDetailedKpis(detailedRes.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching KPI data:", err);
      setError(err.response?.data?.error || err.message || "Failed to load KPIs");
      setNestedKpis([]);
      setDetailedKpis([]);
    } finally {
      setLoading(false);
    }
  };

  if (
    !["strategic unit", "minister", "chief ceo", "ceo", "worker"].includes(role)
  ) {
    return (
      <div className="p-4">
        <p className="text-red-600">You do not have permission to view this data.</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${dark ? "bg-[#1f2937]" : "bg-white"}`}>
      <h1 className={`text-xl font-semibold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
        Export and Reporting Dashboard
      </h1>

      {/* Filters row */}
      <div
        className={`mb-2 p-4 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${
          dark ? "bg-[#1f2937]" : "bg-white"
        }`}
      >
        {/* Sector filter */}
        {showSector && (
          <div className="flex flex-col">
            <label className={labelClasses}>Filter by Sector</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className={inputClasses}
              disabled={role === "chief ceo"}
            >
              <option value="">All Sectors</option>
              {sectors.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.sector_name || s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subsector filter */}
        {showSubsector && (
          <div className="flex flex-col">
            <label className={labelClasses}>Filter by Subsector</label>
            <select
              value={filterSubsector}
              onChange={(e) => setFilterSubsector(e.target.value)}
              className={inputClasses}
              disabled={!filterSector || filteredSubsectors.length === 0}
            >
              <option value="">All Subsectors</option>
              {filteredSubsectors.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subsector_name || sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year filter */}
        <div className="flex flex-col">
          <label className={labelClasses}>Filter by Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className={inputClasses}
          >
            <option value="">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Quarter filter */}
        <div className="flex flex-col">
          <label className={labelClasses}>Filter by Quarter</label>
          <select
            value={filterQuarter}
            onChange={(e) => setFilterQuarter(e.target.value)}
            className={inputClasses}
          >
            {quarters.map((q) => (
              <option key={q} value={q === "All" ? "" : q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Button row */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleLoadKpis}
          aria-label="Search"
          title="Filter KPIs"
          className={`
            flex items-center justify-center w-10 h-10 rounded-md transition
            focus:outline-none focus:ring-2
            ${dark
              ? "bg-[#F36F21] text-white hover:bg-[#e05e1d] focus:ring-[#F36F21]"
              : "bg-[#F36F21] text-white hover:bg-[#e05e1d] focus:ring-[#F36F21]"
            }
          `}
        >
          <MdOutlineSearch size={24} />
        </button>
      </div>

      {loading && <p className={`${dark ? "text-white" : "text-gray-900"}`}>Loading assigned KPIs...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && nestedKpis.length === 0 && <p>No KPIs assigned or failed to load.</p>}

      {!loading && !error && nestedKpis.length > 0 && (
        <KPIGroupedTableReport data={nestedKpis} detailedKpis={detailedKpis} />
      )}
    </div>
  );
}

export default AllSectorReport;
