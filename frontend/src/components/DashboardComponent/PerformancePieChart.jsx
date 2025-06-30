import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import axios from "axios";

const backendUrl = "http://localhost:1221";

const COLORS_LIGHT = ["#76dd82", "#4b49ac", "#74c1e9", "#d17d57"];
const COLORS_DARK = ["#4caf50", "#6c63ff", "#2196f3", "#ff7043"];

const RADIAN = Math.PI / 180;

// Label formatter
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload,
  dark,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0 ? (
    <text
      x={x}
      y={y}
      fill={dark ? "white" : "black"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${payload.name}: ${(percent * 100).toFixed(1)}%`}
    </text>
  ) : null;
};

const PerformancePieChart = () => {
  const { user } = useAuthStore();
  const { dark } = useThemeStore();
  const [chartData, setChartData] = useState([]);

  // Ethiopian year approx
  const currentEthYear =
    new Date().getMonth() + 1 >= 9
      ? new Date().getFullYear() - 7
      : new Date().getFullYear() - 8;

  useEffect(() => {
    if (!user?._id || !user?.sector) return;

    const fetchPerformanceData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/kpi-table-data/table-data`, {
          params: {
            userId: user._id,
            sectorId: user.sector._id || user.sector,
            year: currentEthYear,
          },
        });

        const kpis = res.data;

        let good = 0;
        let average = 0;
        let poor = 0;
        let noData = 0;

        kpis.forEach((kpi) => {
          // Find latest ratio value by year/quarter keys
          const ratioObj = kpi.ratio || {};
          const ratioEntries = Object.entries(ratioObj);

          let latestRatio = null;
          let latestYear = -Infinity;
          let latestQuarter = -1;

          ratioEntries.forEach(([key, val]) => {
            const yearMatch = key.match(/\d{4}/);
            const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
            const quarterMatch = key.toLowerCase().match(/q([1-4])/);
            const quarter = quarterMatch ? parseInt(quarterMatch[1], 10) : 0;

            if (year > latestYear) {
              latestYear = year;
              latestQuarter = quarter;
              latestRatio = val;
            } else if (year === latestYear && quarter > latestQuarter) {
              latestQuarter = quarter;
              latestRatio = val;
            }
          });

          if (latestRatio === null || latestRatio === undefined || latestRatio === 0) {
            noData++;
          } else if (latestRatio >= 75) {
            good++;
          } else if (latestRatio >= 50) {
            average++;
          } else {
            poor++;
          }
        });

        const total = good + average + poor + noData;
        if (total === 0) {
          setChartData([]);
          return;
        }

        setChartData([
          { name: "Good", value: good },
          { name: "Average", value: average },
          { name: "Poor", value: poor },
          { name: "No Data", value: noData },
        ]);
      } catch (err) {
        console.error("Failed to fetch performance pie chart data:", err);
      }
    };

    fetchPerformanceData();
  }, [user, currentEthYear]);

  const containerBg = dark ? "bg-[#1f2937]" : "bg-white";
  const textColor = dark ? "text-white" : "text-[#0D2A5C]";
  const legendTextColor = dark ? "#ddd" : "#333";

  const colors = dark ? COLORS_DARK : COLORS_LIGHT;

  return (
    <div
      className={`w-[500px] rounded-md p-6 shadow-xl transition-colors ${containerBg} ${textColor}`}
    >
      <h3 className="text-left ml-1 text-lg font-semibold mb-4">
        Performance State for {currentEthYear}
      </h3>
      {chartData.length === 0 ? (
        <p className="text-center py-10">No performance data available.</p>
      ) : (
        <PieChart width={500} height={400}>
          <Pie
            data={chartData}
            cx={250}
            cy={200}
            labelLine={false}
            label={(props) => renderCustomizedLabel({ ...props, dark })}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke={dark ? "#222" : "#fff"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: dark ? "#2d3748" : "#fff",
              borderColor: dark ? "#4a5568" : "#ccc",
              color: dark ? "#eee" : "#111",
            }}
          />
          <Legend
            wrapperStyle={{ color: legendTextColor, fontWeight: "bold" }}
          />
        </PieChart>
      )}
    </div>
  );
};

export default PerformancePieChart;
