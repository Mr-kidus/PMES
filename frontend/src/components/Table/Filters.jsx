import React from "react";
import useThemeStore from "../../store/themeStore";

function Filters({
  role,
  filterYear,
  setFilterYear,
  filterQuarter,
  setFilterQuarter,
  filterSector,
  setFilterSector,
  filterSubsector,
  setFilterSubsector,
  sectors = [], // [{_id, name}]
  subsectors = [], // [{_id, subsector_name}]
}) {
  const { dark } = useThemeStore();

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

  const normalizedRole = role?.toLowerCase() || "";

  return (
    <div
      className={`mb-6 p-4 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${
        dark ? "bg-[#1f2937]" : "bg-white"
      }`}
    >
      {/* Strategic and Minister can filter by sector */}
      {(normalizedRole === "strategic" || normalizedRole === "minister") && (
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
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* All roles except Worker can filter by subsector */}
      {normalizedRole !== "worker" && (
        <div className="flex flex-col">
          <label className={labelClasses}>Filter by Subsector</label>
          <select
            value={filterSubsector}
            onChange={(e) => setFilterSubsector(e.target.value)}
            className={inputClasses}
          >
            <option value="">All Subsectors</option>
            {subsectors.map((sub) => (
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
  );
}

export default Filters;
