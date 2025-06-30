import React from "react";
import useThemeStore from "../../store/themeStore";

const clusters = [
  {
    title:
      "Harnessing Digitalisation for Government Services and Commercial Systems",
    colorLight: "fill-sky-300",
    colorDark: "fill-sky-600",
    x: 250,
    y: 150,
    items: 5,
  },
  {
    title:
      "Enhancing National R&D Capability for Innovation and Technology Transfer",
    colorLight: "fill-green-300",
    colorDark: "fill-green-600",
    x: 150,
    y: 180,
    items: 5,
  },
  {
    title:
      "Promoting High-Tech Industries for Economic Value-Adding and Diversification",
    colorLight: "fill-orange-300",
    colorDark: "fill-orange-600",
    x: 180,
    y: 70,
    items: 2,
    labels: [""],
  },
  {
    title: "Strengthening STI and ICT Regulatory Ecosystem",
    colorLight: "fill-purple-300",
    colorDark: "fill-purple-600",
    x: 240,
    y: 260,
    items: 5,
  },
];

const StrategicGoalsDiagram = () => {
  const { dark } = useThemeStore();

  return (
    <div className={`flex flex-col items-center p-4 rounded-md transition-colors ${
      dark ? "bg-[#1f2937] text-white" : "bg-white text-[#0D2A5C]"
    }`}>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Strategic Goals and Key Result Areas
      </h2>

      <svg width="500" height="350" className="mb-6">
        {clusters.map((cluster, idx) => {
          const fillColor = dark ? cluster.colorDark : cluster.colorLight;

          return (
            <g key={idx}>
              <circle
                cx={cluster.x}
                cy={cluster.y}
                r="50"
                className={`${fillColor} opacity-60`}
              />
              {[...Array(cluster.items)].map((_, i) => {
                const angle = (2 * Math.PI * i) / cluster.items;
                const cx = cluster.x + Math.cos(angle) * 20;
                const cy = cluster.y + Math.sin(angle) * 20;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="10"
                    className={`${fillColor} opacity-100`}
                  />
                );
              })}
              {cluster.labels?.map((label, i) => (
                <text
                  key={i}
                  x={cluster.x}
                  y={cluster.y + 20 * i}
                  textAnchor="middle"
                  fontSize="10"
                  fill={dark ? "#ddd" : "#000"}
                >
                  {label}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      <div className="space-y-3 text-sm max-w-[480px]">
        {clusters.map((cluster, idx) => {
          const bgColor = dark ? "bg-gray-700" : "bg-gray-100";
          const textColor = dark ? "text-white" : "text-[#0D2A5C]";
          const dotColor = dark ? cluster.colorDark : cluster.colorLight;

          return (
            <div
              key={idx}
              className={`flex items-center space-x-3 p-2 rounded ${bgColor} ${textColor} shadow-sm`}
            >
              <span
                className={`w-5 h-5 inline-block rounded-full ${dotColor}`}
                aria-hidden="true"
              />
              <span>{cluster.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategicGoalsDiagram;
