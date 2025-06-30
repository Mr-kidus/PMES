import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { transformAssignedKpisToNested } from "../../utils/transformAssignedKpisToNested";
import KPIGroupedTable from "../Table/KPIGroupedTable";
import useThemeStore from "../../store/themeStore";
import useAuthStore from "../../store/auth.store";

const BACKEND_PORT = 1221;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

function AllSector() {
  const { sectorId: sectorIdFromParams } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  const { dark } = useThemeStore();
  const { user } = useAuthStore();

  // Filters state
  const [filterSector, setFilterSector] = useState(sectorIdFromParams || "");
  const [filterSubsector, setFilterSubsector] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");

  // Dropdown data
  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [filteredSubsectors, setFilteredSubsectors] = useState([]);

  // KPI data
  const [assignedKpisRaw, setAssignedKpisRaw] = useState(null);
  const [nestedKpis, setNestedKpis] = useState([]);
  const [detailedKpis, setDetailedKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sectors & subsectors once on mount
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [sectorRes, subsectorRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/sector/get-sector`),
          axios.get(`${BACKEND_URL}/api/subsector/get-subsector`),
        ]);
        setSectors(sectorRes.data?.data || []);
        setSubsectors(subsectorRes.data || []);
      } catch (err) {
        console.error("Failed to fetch sectors/subsectors:", err);
      }
    }
    fetchDropdownData();
  }, []);

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
  }, [filterSector, subsectors]);

  // Styling classes for inputs
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

  // Determine role (lowercase for comparison)
  const normalizedRole = (user?.role || "").toLowerCase();

  // Fetch KPI data automatically when filters change
  useEffect(() => {
    async function fetchData() {
      // If role is worker or CEO, no sector or subsector filters allowed — fetch without filters
      if ((normalizedRole === "worker" || normalizedRole === "ceo") && sectorIdFromParams) {
        // Possibly fetch only sectorId from params or fetch all assigned KPIs? Adjust as needed
        // For now, just fetch assigned KPIs by sectorId param if available
        setFilterSector(""); // clear filters
        setFilterSubsector("");
      }

      if (!filterSector && !filterSubsector) {
        setNestedKpis([]);
        setDetailedKpis([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let assignedData = [];

        if (filterSubsector) {
          // fetch by subsector
          const assignedRes = await axios.get(
            `${BACKEND_URL}/api/assign/assigned-kpi-with-goal-details/${filterSubsector}`,
            { headers: { Accept: "application/json" } }
          );
          assignedData = assignedRes.data;

          setAssignedKpisRaw(assignedData);

          const nested = transformAssignedKpisToNested(assignedData);
          setNestedKpis(nested);

          const detailedRes = await axios.get(
            `${BACKEND_URL}/api/assign/details/by-subsector/${filterSubsector}`,
            { headers: { Accept: "application/json" } }
          );
          setDetailedKpis(detailedRes.data || []);
        } else if (filterSector) {
          // fetch by sector
          const assignedRes = await axios.get(
            `${BACKEND_URL}/api/assign/sector/${filterSector}`,
            { headers: { Accept: "application/json" } }
          );
          assignedData = assignedRes.data;

          setAssignedKpisRaw(assignedData);

          const nested = transformAssignedKpisToNested(assignedData);
          setNestedKpis(nested);

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
    }

    fetchData();
  }, [filterSector, filterSubsector, normalizedRole, sectorIdFromParams]);

  return (
    <div className={`p-4 ${dark ? "bg-[#1f2937]" : "bg-white"}`}>
      

      <div
        className={`mb-6 p-4 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${
          dark ? "bg-[#1f2937]" : "bg-white"
        }`}
      >
        {/* Show sector dropdown only if NOT Chief CEO, Worker, or CEO */}
        {!(normalizedRole === "chie f ceo" || normalizedRole === "worker" || normalizedRole === "ceo") && (
          <div className="flex flex-col">
            <label className={labelClasses}>Filter by Sector</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className={inputClasses}
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

        {/* Show subsector dropdown only if NOT Worker or CEO */}
        {!(normalizedRole === "worker" || normalizedRole === "ceo") && (
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
      <h1 className={`text-xl font-semibold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
        <hr />
      </h1>

      {loading && <p className={dark ? "text-white" : "text-gray-900"}>Loading assigned KPIs...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && nestedKpis.length === 0 && <p>No KPIs assigned or failed to load.</p>}

      {!loading && !error && nestedKpis.length > 0 && (
        <KPIGroupedTable data={nestedKpis} detailedKpis={detailedKpis} />
      )}
    </div>
  );
}

export default AllSector;
