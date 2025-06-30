import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { transformAssignedKpisToNested } from "../../utils/transformAssignedKpisToNested";
import KPIGroupedTableReport from "../Table/KPIGroupedTableReport";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import { FiSearch } from "react-icons/fi";

const BACKEND_PORT = 1221;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

function AllSubsectorReport() {
  const { subsectorId } = useParams();
  const { user } = useAuthStore();
  const { dark } = useThemeStore();

  const [assignedKpisRaw, setAssignedKpisRaw] = useState(null);
  const [nestedKpis, setNestedKpis] = useState([]);
  const [filteredKpis, setFilteredKpis] = useState([]);
  const [detailedKpis, setDetailedKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filterYear, setFilterYear] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);

  const quarters = ["All", "Q1", "Q2", "Q3", "Q4"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 2015 + 2 },
    (_, i) => (2015 + i).toString()
  );

  // Fetch KPIs on load
  useEffect(() => {
    if (!user || !subsectorId) {
      setNestedKpis([]);
      setDetailedKpis([]);
      setFilteredKpis([]);
      setError(null);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const assignedRes = await fetch(
          `${BACKEND_URL}/api/assign/assigned-kpi-with-goal-details/${subsectorId}`,
          { headers: { Accept: "application/json" } }
        );

        if (!assignedRes.ok) {
          throw new Error(
            `Assigned KPIs fetch failed with status: ${assignedRes.status}`
          );
        }

        const assignedData = await assignedRes.json();
        setAssignedKpisRaw(assignedData);

        const nested = transformAssignedKpisToNested(assignedData);
        setNestedKpis(nested);
        setFilteredKpis(nested);

        const detailedRes = await fetch(
          `${BACKEND_URL}/api/assign/details/by-subsector/${subsectorId}`,
          { headers: { Accept: "application/json" } }
        );

        if (!detailedRes.ok) {
          setDetailedKpis([]);
        } else {
          const detailedData = await detailedRes.json();
          setDetailedKpis(detailedData);
        }
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        setNestedKpis([]);
        setFilteredKpis([]);
        setDetailedKpis([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, subsectorId]);

  // Apply filters only when button clicked
  useEffect(() => {
    if (!filterApplied) {
      setFilteredKpis(nestedKpis);
      return;
    }

    const filtered = nestedKpis.filter(
      (group) =>
        Array.isArray(group.kpis) &&
        group.kpis.some((kpi) => {
          const matchYear = filterYear ? kpi.year === filterYear : true;
          const matchQuarter = filterQuarter ? kpi.quarter === filterQuarter : true;
          return matchYear && matchQuarter;
        })
    );

    setFilteredKpis(filtered);
  }, [filterApplied, filterYear, filterQuarter, nestedKpis]);

  // Styling
  const inputClasses = `
    w-full md:w-48 px-3 py-2 rounded-md border text-sm transition focus:outline-none focus:ring-2
    ${dark
      ? "bg-[#1f2937] text-white border-gray-600 placeholder-gray-400 focus:ring-[#F36F21]"
      : "bg-white text-[rgba(13,42,92,0.85)] border border-gray-300 placeholder-gray-500 focus:ring-[#0D2A5C]"
    }
  `;

  const labelClasses = `text-xs font-medium mb-1 ${
    dark ? "text-gray-300" : "text-[rgba(13,42,92,0.8)]"
  }`;

  return (
    <div className={`p-4 ${dark ? "bg-[#1f2937]" : "bg-white"}`}>
      <h1 className={`text-xl font-semibold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
        Subsector Export and Reporting Dashboard
      </h1>

      {/* Filters */}
      <div
        className={`mb-6 p-4 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-3 gap-4 items-end ${
          dark ? "bg-[#1f2937]" : "bg-white"
        }`}
      >
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

        <button
          onClick={() => setFilterApplied((prev) => !prev)}
          title="Apply Filters"
          className="w-10 h-10 rounded bg-[#0D2A5C] hover:bg-[#0b244d] flex justify-center items-center text-white transition"
        >
          <FiSearch size={20} />
        </button>
      </div>

      {/* KPI Table & messages */}
      {loading && <p className={dark ? "text-white" : "text-gray-900"}>Loading assigned KPIs...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filteredKpis.length === 0 && <p className={dark ? "text-white" : "text-gray-900"}>No KPIs assigned or matched filters.</p>}
      {!loading && !error && filteredKpis.length > 0 && (
        <KPIGroupedTableReport data={filteredKpis} detailedKpis={detailedKpis} />
      )}
    </div>
  );
}

export default AllSubsectorReport;
