import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";

const backendUrl = "http://localhost:1221";

const ProgressBar = ({ progress, dark }) => {
  const getColor = (val) => {
    if (val >= 100) return dark ? "bg-green-600" : "bg-green-500";
    if (val >= 74) return dark ? "bg-green-500" : "bg-green-400";
    if (val >= 50) return dark ? "bg-yellow-500" : "bg-yellow-400";
    return dark ? "bg-red-600" : "bg-red-400";
  };

  const bgColor = dark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className={`w-full rounded-full h-3 overflow-hidden ${bgColor}`}>
      <div
        className={`h-3 ${getColor(progress)}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const KPIProgressTable = () => {
  const { user } = useAuthStore();
  const { dark } = useThemeStore();
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ethiopian year approx calculation
  const currentEthYear =
    new Date().getMonth() + 1 >= 9
      ? new Date().getFullYear() - 7
      : new Date().getFullYear() - 8;

  useEffect(() => {
    if (!user?._id || !user?.sector) return;

    const fetchKpiData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${backendUrl}/api/kpi-table-data/table-data`,
          {
            params: {
              userId: user._id,
              sectorId: user.sector._id || user.sector,
              year: currentEthYear,
            },
          }
        );

        // For each KPI, find the latest performance value (yearly or quarterly)
        const fetched = res.data.map((item) => {
          // performance keys could be like 'year-2024', 'q1-2024', etc.
          // get latest performance by keys with the highest year or quarter

          // Extract keys that are numeric for sorting
          const performanceObj = item.performance || {};
          const performanceEntries = Object.entries(performanceObj);

          // Find the entry with the latest year & quarter
          // We'll parse keys like 'year-2024' or 'q3-2024' and find max year and quarter
          let latestPerfValue = null;
          let latestYear = -Infinity;
          let latestQuarter = -1;

          performanceEntries.forEach(([key, val]) => {
            const mYear = key.match(/\d{4}/);
            const year = mYear ? parseInt(mYear[0], 10) : null;
            const quarterMatch = key.toLowerCase().match(/q([1-4])/);
            const quarter = quarterMatch ? parseInt(quarterMatch[1], 10) : 0;

            if (year > latestYear) {
              latestYear = year;
              latestQuarter = quarter;
              latestPerfValue = val;
            } else if (year === latestYear && quarter > latestQuarter) {
              latestQuarter = quarter;
              latestPerfValue = val;
            }
          });

          // Similarly for ratio
          const ratioObj = item.ratio || {};
          let latestRatioValue = null;
          const ratioEntries = Object.entries(ratioObj);
          let latestRatioYear = -Infinity;
          let latestRatioQuarter = -1;
          ratioEntries.forEach(([key, val]) => {
            const mYear = key.match(/\d{4}/);
            const year = mYear ? parseInt(mYear[0], 10) : null;
            const quarterMatch = key.toLowerCase().match(/q([1-4])/);
            const quarter = quarterMatch ? parseInt(quarterMatch[1], 10) : 0;

            if (year > latestRatioYear) {
              latestRatioYear = year;
              latestRatioQuarter = quarter;
              latestRatioValue = val;
            } else if (year === latestRatioYear && quarter > latestRatioQuarter) {
              latestRatioQuarter = quarter;
              latestRatioValue = val;
            }
          });

          return {
            kpi: item.kpiName,
            performance: latestPerfValue ?? "-",
            progress: latestRatioValue ?? 0,
          };
        });

        setKpiData(fetched);
      } catch (error) {
        console.error("Failed to fetch KPI progress table:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, [user, currentEthYear]);

  const textColor = dark ? "text-white" : "text-[#0D2A5C]";
  const tableBg = dark ? "bg-[#1f2937]" : "bg-white";
  const borderColor = dark ? "border-gray-700" : "border-gray-300";
  const headerBg = dark ? "bg-gray-800" : "bg-gray-100";
  const rowHover = dark ? "hover:bg-gray-700" : "hover:bg-gray-50";

  return (
    <div
      className={`max-w-xl mx-auto p-4 shadow-xl mb-10 rounded-md transition-colors ${tableBg} ${textColor}`}
    >
      <h2 className="text-xl font-semibold mb-4">Recent Performance</h2>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full border ${borderColor} text-sm`}>
            <thead>
              <tr className={`${headerBg} text-left`}>
                <th className={`p-3 border-b ${borderColor}`}>KPI</th>
                <th className={`p-3 border-b ${borderColor}`}>Performance</th>
                <th className={`p-3 border-b ${borderColor}`}>Progress</th>
                <th className={`p-3 border-b ${borderColor}`}>Label</th>
              </tr>
            </thead>
            <tbody>
              {kpiData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    No data available
                  </td>
                </tr>
              ) : (
                kpiData.map((item, index) => (
                  <tr
                    key={index}
                    className={`${borderColor} border-t ${rowHover} cursor-pointer`}
                  >
                    <td className="p-3">{item.kpi}</td>
                    <td className="p-3">{item.performance}</td>
                    <td className="p-3 w-24">
                      <ProgressBar progress={item.progress} dark={dark} />
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.progress === 100
                            ? dark
                              ? "bg-green-800 text-green-200"
                              : "bg-green-100 text-green-800"
                            : item.progress >= 74
                            ? dark
                              ? "bg-green-700 text-green-100"
                              : "bg-green-100 text-green-600"
                            : item.progress >= 50
                            ? dark
                              ? "bg-yellow-700 text-yellow-200"
                              : "bg-yellow-100 text-yellow-700"
                            : dark
                            ? "bg-red-700 text-red-200"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.progress}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KPIProgressTable;
