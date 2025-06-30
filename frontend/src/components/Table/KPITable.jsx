import React from "react";
import useThemeStore from "../../store/themeStore";

function KPITable({ groupKey, rows, openModal, openPerformanceModal, openRatioModal, currentEthYear, canEdit }) {
  const { dark } = useThemeStore();

  const [goal = "", kra = ""] = groupKey.split("|||").map((s) => s.trim());

  const recentYear = currentEthYear;
  const previousYear = currentEthYear - 1;

  const getValue = (obj, key) => {
    if (!obj) return undefined;
    if (obj[key] !== undefined) return obj[key];

    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    if (foundKey) return obj[foundKey];

    const quarterMatch = key.toLowerCase().match(/^(q[1-4])(?:-(\d{4}))?$/);
    if (quarterMatch) {
      const quarter = quarterMatch[1];
      const yearPart = quarterMatch[2];
      if (yearPart) {
        if (obj[quarter] !== undefined) return obj[quarter];
      } else {
        if (obj[`${quarter}-${recentYear}`] !== undefined) return obj[`${quarter}-${recentYear}`];
        if (obj[`${quarter}-${previousYear}`] !== undefined) return obj[`${quarter}-${previousYear}`];
      }
    }

    if (key.toLowerCase().startsWith("year")) {
      if (key.toLowerCase() === "year") {
        if (obj[`year-${recentYear}`] !== undefined) return obj[`year-${recentYear}`];
        if (obj[`year-${previousYear}`] !== undefined) return obj[`year-${previousYear}`];
      } else {
        if (obj["year"] !== undefined) return obj["year"];
      }
    }

    return undefined;
  };

  const formatRatio = (perf, target) => {
    if (typeof perf === "number" && typeof target === "number" && target !== 0) {
      return `${Math.round((perf / target) * 100)}%`;
    }
    return "–";
  };

  const baseBtn =
    "text-xs px-2 py-1 rounded font-medium transition duration-200 w-full text-center whitespace-nowrap";

  const borderColor = dark ? "border-gray-700" : "border-gray-300";
  const headerBg = dark ? "bg-gray-800 text-white" : "bg-gray-100 text-[#0D2A5C]";
  const rowHoverBg = dark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const cardBg = dark ? "bg-[#1f2937] text-white" : "bg-white text-[rgba(13,42,92,0.85)]";

  const goalHeaderBg = dark ? "bg-[#b44d12]" : "bg-[#F36F21]";
  const goalHeaderText = "text-white";
  const kraHeaderBg = dark ? "bg-gray-700" : "bg-gray-200";
  const kraHeaderText = dark ? "text-white" : "text-[#0D2A5C]";

  const quarters = ["q1", "q2", "q3", "q4"];

const renderPlanCell = (row, periodKey) => {
  const val = getValue(row.targets, periodKey);
  const editable = canEdit ? canEdit(row) : true;

  return (
    <button
      onClick={() => {
        console.log("🟢 Plan Cell clicked", { editable, row, periodKey });
        if (editable) {
          openModal({ ...row, period: periodKey });
        } else {
          console.log("⛔ Plan Cell NOT editable, modal NOT opened");
        }
      }}
      className={`${
        dark
          ? "bg-[#F36F21] hover:bg-orange-600 text-gray-900"
          : "bg-[#F36F21] hover:bg-orange-700 text-white"
      } ${baseBtn} ${!editable ? "cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
      title="Plan Target"
      type="button"
    >
      🎯 {val != null && val !== "" ? val : "-"}
    </button>
  );
};

const renderPerformanceCell = (row, periodKey) => {
  const val = getValue(row.performance, periodKey);
  const editable = canEdit ? canEdit(row) : true;

  return (
    <button
      onClick={() => {
        console.log("🔵 Performance Cell clicked", { editable, row, periodKey });
        if (editable) {
          openPerformanceModal({ ...row, period: periodKey });
        } else {
          console.log("⛔ Performance Cell NOT editable, modal NOT opened");
        }
      }}
      className={`${
        dark
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-blue-700 hover:bg-blue-800 text-white"
      } ${baseBtn} ${!editable ? "cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
      title="Performance"
      type="button"
    >
      📊 {val != null && val !== "" ? val : "-"}
    </button>
  );
};

const renderRatioCell = (row, periodKey) => {
  const target = getValue(row.targets, periodKey);
  const perf = getValue(row.performance, periodKey);
  const editable = canEdit ? canEdit(row) : true;

  return (
    <button
      onClick={() => {
        console.log("⚪ Ratio Cell clicked", { editable, row, periodKey });
        if (editable) {
          openRatioModal(row, periodKey);
        } else {
          console.log("⛔ Ratio Cell NOT editable, modal NOT opened");
        }
      }}
      className={`${
        dark
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-gray-300 hover:bg-gray-400 text-gray-900"
      } ${baseBtn} ${!editable ? "cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
      title="Ratio"
      type="button"
    >
      %
      {!isNaN(Number(perf)) && !isNaN(Number(target)) && Number(target) !== 0
        ? ` ${formatRatio(Number(perf), Number(target))}`
        : " –"}
    </button>
  );
};



  return (
    <div className={`p-6 mb-10 rounded overflow-hidden shadow-md transition ${cardBg}`}>
      {/* Goal Header */}
      <div className={`p-3 font-bold text-sm ${goalHeaderBg} ${goalHeaderText} flex items-center gap-2`}>
        <span role="img" aria-label="Goal">
          🎯
        </span>{" "}
        Goal: {goal}
      </div>

      {/* KRA Header */}
      <div className={`p-3 font-semibold text-sm ${kraHeaderBg} ${kraHeaderText} flex items-center gap-2 mb-4`}>
        <span role="img" aria-label="KRA">
          🏷️
        </span>{" "}
        KRA: {kra}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className={`border-b ${headerBg}`}>
              <th className={`border px-3 py-2 ${borderColor} text-left`}>KPI Name</th>
              <th className={`border px-3 py-2 ${borderColor} text-center`}>{previousYear}</th>
              <th className={`border px-3 py-2 ${borderColor} text-center`}>{recentYear}</th>
              {quarters.map((q) => (
                <th key={q} className={`border px-3 py-2 ${borderColor} text-center`}>
                  {q.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b ${borderColor} ${rowHoverBg}`}>
                <td className="px-3 py-2 text-left font-medium">{row.kpiName}</td>

                {[`year-${previousYear}`, `year-${recentYear}`].map((periodKey) => (
                  <td key={periodKey} className="px-3 py-2 text-center align-top">
                    <div className="flex flex-col gap-1">
                      {renderPlanCell(row, periodKey)}
                      {renderPerformanceCell(row, periodKey)}
                      {renderRatioCell(row, periodKey)}
                    </div>
                  </td>
                ))}

                {quarters.map((q) => {
                  const periodKey = `${q}-${recentYear}`;
                  return (
                    <td key={q} className="px-3 py-2 text-center align-top">
                      <div className="flex flex-col gap-1">
                        {renderPlanCell(row, periodKey)}
                        {renderPerformanceCell(row, periodKey)}
                        {renderRatioCell(row, periodKey)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KPITable;
