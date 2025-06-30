import React from "react";

const data = [
  { type: "goal", text: "Goal" },
  { type: "kra", text: "KRA" },
  { type: "kpi", indicator: "KPI 1", value: ["50.0", "30.0"] },
  { type: "kpi", indicator: "KPI 2", value: ["50.0", "38.0"] },
  { type: "kpi", indicator: "KPI 3", value: ["23.0", "24.0"] },
  { type: "kpi", indicator: "KPI 4", value: ["70.0", "64.0"] },
  { type: "kpi", indicator: "KPI 5", value: ["10", "23.0"] },
];

const DynamicTable = () => {
  return (
    <div className="bg-gray-100 p-6">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-green-500 text-white">
            <th className="w-1/4 py-2">Indicator</th>
            <th className="w-1/4 py-2">Value</th>
            <th className="w-1/4 py-2">Validate</th>
            <th className="w-1/4 py-2">Validation Comment</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            if (item.type === "goal" || item.type === "kra") {
              return (
                <tr key={index} className="bg-green-500 text-white">
                  <td colSpan="4" className="py-2">
                    {item.text}
                  </td>
                </tr>
              );
            } else if (item.type === "kpi") {
              return (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.indicator}</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col space-y-2">
                      {item.value.map((val, idx) => (
                        <button
                          key={idx}
                          className="bg-blue-500 text-white py-1 px-2 rounded"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <input type="checkbox" />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      placeholder="Enter comment..."
                      className="w-full"
                    />
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
