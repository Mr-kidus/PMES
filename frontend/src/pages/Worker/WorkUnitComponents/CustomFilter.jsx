import React, { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import useThemeStore from "../../../store/themeStore";

const CustomFilter = ({ onFilterChange }) => {
  const dark = useThemeStore((state) => state.dark);
  const [timePeriod, setTimePeriod] = useState("quarterly");
  const [yearQuarterOptions, setYearQuarterOptions] = useState([]);
  const [selectedYearQuarter, setSelectedYearQuarter] = useState("");

  useEffect(() => {
    const currentGregorianYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentEthioYear = currentMonth >= 9 ? currentGregorianYear - 7 : currentGregorianYear - 8;

    if (timePeriod === "yearly") {
      const years = Array.from({ length: 5 }, (_, i) => (currentEthioYear - i).toString());
      setYearQuarterOptions(years);
    } else {
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      setYearQuarterOptions(quarters.map((q) => `${currentEthioYear} - ${q}`));
    }

    setSelectedYearQuarter("");
  }, [timePeriod]);

  const handleFilter = () => {
    if (onFilterChange) {
      onFilterChange({ timePeriod, selectedYearQuarter });
    }
  };

  return (
    <div className="rounded shadow-md overflow-hidden">
      <div
        className={`px-4 py-2 font-semibold text-lg ${
          dark ? "bg-gray-800 text-white" : "bg-[rgba(13,42,92,0.85)] text-white"
        }`}
      >
        Custom Filter
      </div>
      <div className={`${dark ? "bg-gray-900 text-white" : "bg-white text-[rgba(13,42,92,0.85)]"} p-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-around gap-4">
          <div className="flex flex-col w-full max-w-xs">
            <label className="font-semibold mb-1">Select Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className={`border px-3 py-2 rounded focus:outline-none ${
                dark
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white border-[rgba(13,42,92,0.3)]"
              }`}
            >
              <option value="yearly">Yearly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div className="flex flex-col w-full max-w-xs">
            <label className="font-semibold mb-1">
              Select {timePeriod === "yearly" ? "Year" : "Quarter"}
            </label>
            <select
              value={selectedYearQuarter}
              onChange={(e) => setSelectedYearQuarter(e.target.value)}
              className={`border px-3 py-2 rounded focus:outline-none ${
                dark
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white border-[rgba(13,42,92,0.3)]"
              }`}
            >
              <option value="">-- Select --</option>
              {yearQuarterOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 bg-[rgba(13,42,92,0.85)] hover:bg-[rgba(13,42,92,0.95)] text-white font-semibold px-4 py-2 rounded transition"
          >
            <FaFilter />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFilter;
