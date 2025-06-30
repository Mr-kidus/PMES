import React, { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";

const CustomFilter = () => {
  const [timePeriod, setTimePeriod] = useState("quarterly");
  const [yearQuarterOptions, setYearQuarterOptions] = useState([]);
  const [selectedYearQuarter, setSelectedYearQuarter] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (timePeriod === "yearly") {
      const years = Array.from({ length: 5 }, (_, i) =>
        (currentYear - i).toString()
      );
      setYearQuarterOptions(years);
    } else {
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      setYearQuarterOptions(quarters.map((q) => `${currentYear} - ${q}`));
    }
    setSelectedYearQuarter("");
  }, [timePeriod]);

  const handleFilter = () => {
    console.log({ timePeriod, selectedYearQuarter, sector });
  };

  return (
    <div className="border rounded shadow-md">
      <div className="bg-green-700 text-white px-4 py-2 rounded-t">
        <h2 className="text-lg font-semibold">Custom Filter</h2>
      </div>

      <div className="p-4 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-around gap-4">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Select Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="border px-3 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="yearly">Yearly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Select {timePeriod === "yearly" ? "Year" : "Quarter"}:
            </label>
            <select
              value={selectedYearQuarter}
              onChange={(e) => setSelectedYearQuarter(e.target.value)}
              className="border px-3 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="flex cursor-pointer items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded"
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
