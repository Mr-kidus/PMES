import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axios from "axios";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";

const TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const getColor = (value) => {
  if (value < 30) return "#DF5353";
  if (value < 70) return "#DDDF0D";
  return "#55BF3B";
};

const KpiGaugeChart = () => {
  const [kpiAverage, setKpiAverage] = useState(0);
  const { user } = useAuthStore();
  const { dark } = useThemeStore();

  const year = new Date().getFullYear() - 8;

  useEffect(() => {
    const fetchRatioData = async () => {
      try {
        const res = await axios.get("http://localhost:1221/api/kpi-table-data/table-data", {
          params: {
            userId: user?._id,
            year,
            sectorId: user?.sector?._id || user?.sector,
            subsectorId: user?.subsector?._id || user?.subsector,
          },
        });

        const data = res.data || [];
        if (data.length === 0) {
          setKpiAverage(0);
          return;
        }

        // Extract latest ratio per KPI, similar to your other charts
        const getLatestRatio = (ratioObj) => {
          if (!ratioObj) return 0;
          const entries = Object.entries(ratioObj);
          let latestYear = -Infinity;
          let latestQuarter = -1;
          let latestValue = 0;

          entries.forEach(([key, val]) => {
            const yearMatch = key.match(/\d{4}/);
            const y = yearMatch ? parseInt(yearMatch[0], 10) : null;
            const quarterMatch = key.toLowerCase().match(/q([1-4])/);
            const q = quarterMatch ? parseInt(quarterMatch[1], 10) : 0;

            if (y > latestYear) {
              latestYear = y;
              latestQuarter = q;
              latestValue = val;
            } else if (y === latestYear && q > latestQuarter) {
              latestQuarter = q;
              latestValue = val;
            }
          });

          return Number(latestValue) || 0;
        };

        const ratios = data.map((d) => getLatestRatio(d.ratio));
        const avg = ratios.reduce((acc, val) => acc + val, 0) / ratios.length;
        setKpiAverage(Number(avg.toFixed(2)));
      } catch (err) {
        console.error("Failed to fetch KPI average:", err);
      }
    };

    if (user?._id && (user?.sector || user?.subsector)) {
      fetchRatioData();
    }
  }, [user, year]);

  const clamped = Math.max(0, Math.min(100, kpiAverage));
  const angleDeg = (clamped / 100) * 180;

  const gaugeData = Array.from({ length: 10 }, (_, i) => ({
    value: 10,
    color: getColor(i * 10 + 5),
  }));

  const getNeedlePath = () => {
    const centerX = 200;
    const centerY = 130;
    const r = 80;
    const baseWidth = 5;

    const theta = (Math.PI * (180 - angleDeg)) / 180;
    const tipX = centerX + r * Math.cos(theta);
    const tipY = centerY - r * Math.sin(theta);

    const leftX = centerX + baseWidth * Math.cos(theta + Math.PI / 2);
    const leftY = centerY - baseWidth * Math.sin(theta + Math.PI / 2);

    const rightX = centerX + baseWidth * Math.cos(theta - Math.PI / 2);
    const rightY = centerY - baseWidth * Math.sin(theta - Math.PI / 2);

    return `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY} Z`;
  };

  const renderTicks = () => {
    const radius = 120;
    const centerX = 200;
    const centerY = 130;
    const fillColor = dark ? "#ddd" : "#333";

    return TICKS.map((tick) => {
      const tickAngle = 180 - (tick / 100) * 180;
      const rad = (Math.PI * tickAngle) / 180;
      const x = centerX + radius * Math.cos(rad);
      const y = centerY - radius * Math.sin(rad);

      return (
        <text
          key={tick}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill={fillColor}
          fontWeight="bold"
        >
          {tick}
        </text>
      );
    });
  };

  const containerBg = dark ? "bg-[#1f2937]" : "bg-white";
  const textColor = dark ? "text-white" : "text-[#0D2A5C]";

  return (
    <div className={`flex flex-col items-center p-6 rounded-md shadow-xl transition-colors ${containerBg} ${textColor}`}>
      <h2 className="text-xl font-semibold mb-6">Avg KPI ScoreCard</h2>
      <div className="w-[400px] h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              dataKey="value"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {renderTicks()}
          </PieChart>
        </ResponsiveContainer>

        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 250"
        >
          <path d={getNeedlePath()} fill={dark ? "#eee" : "#444"} />
        </svg>
      </div>
      <p className="text-lg font-bold mt-[-10px]">{clamped.toFixed(2)} %</p>
    </div>
  );
};

export default KpiGaugeChart;
