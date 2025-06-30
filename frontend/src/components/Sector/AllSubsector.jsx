import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { transformAssignedKpisToNested } from "../../utils/transformAssignedKpisToNested";
import KPIGroupedTable from "../Table/KPIGroupedTable";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";

const BACKEND_PORT = 1221;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

function AllSubsector() {
  const { subsectorId: subsectorIdFromParams } = useParams();
  const { user } = useAuthStore();
  const { dark } = useThemeStore();

  // Filters
  const [filterSector, setFilterSector] = useState("");
  const [filterSubsector, setFilterSubsector] = useState(subsectorIdFromParams || "");
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

  // Fetch sectors and subsectors once on mount
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

  // Filter subsectors by sector
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

  const normalizedRole = (user?.role || "").toLowerCase();

  // Fetch KPIs automatically when filters change
  useEffect(() => {
    if (!user) {
      setNestedKpis([]);
      setDetailedKpis([]);
      setError(null);
      return;
    }

    // Restrict filters according to role
    if (normalizedRole === "worker" || normalizedRole === "ceo") {
      // worker and CEO can't filter by subsector or sector; ignore filters and use subsectorId from params if available
      setFilterSector("");
      setFilterSubsector(subsectorIdFromParams || "");
    }

    async function fetchData() {
      if (!filterSubsector) {
        setNestedKpis([]);
        setDetailedKpis([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const assignedRes = await axios.get(
          `${BACKEND_URL}/api/assign/assigned-kpi-with-goal-details/${filterSubsector}`,
          { headers: { Accept: "application/json" } }
        );
        const assignedData = assignedRes.data;
        setAssignedKpisRaw(assignedData);

        const nested = transformAssignedKpisToNested(assignedData);
        setNestedKpis(nested);
        console.log("Nested KPIs:", nested);

        const detailedRes = await axios.get(
          `${BACKEND_URL}/api/assign/details/by-subsector/${filterSubsector}`,
          { headers: { Accept: "application/json" } }
        );
        setDetailedKpis(detailedRes.data || []);
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
  }, [filterSubsector, normalizedRole, subsectorIdFromParams, user]);

  return (
    <div className={`p-4 ${dark ? "bg-[#1f2937]" : "bg-white"}`}>
      

      <div
        className={`mb-6 p-4 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${
          dark ? "bg-[#1f2937]" : "bg-white"
        }`}
      >
        {/* Sector filter only if NOT Chief CEO, Worker, or CEO */}
        {!(normalizedRole === "chief ceo" || normalizedRole === "worker" || normalizedRole === "ceo") && (
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

        {/* Subsector filter only if NOT Worker or CEO */}
        {!(normalizedRole === "worker" || normalizedRole === "ceo") && (
          <div className="flex flex-col">
            <label className={labelClasses}>Filter by Subsector</label>
            <select
              value={filterSubsector}
              onChange={(e) => setFilterSubsector(e.target.value)}
              className={inputClasses}
              disabled={!filterSector && !(normalizedRole === "chief ceo" || normalizedRole === "worker" || normalizedRole === "ceo")}
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

export default AllSubsector;
