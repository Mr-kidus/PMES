import React, { useState } from "react";
import useThemeStore from "../../store/themeStore";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const translations = {
  en: {
    plan: "Plan",
    performance: "Performance",
    ratio: "Ratio",
    all: "All",
    kpiName: "KPI Name",
    year: (y) => `${y}`,
    quarter: (q) => q,
    exportPDF: "Export PDF",
    exportExcel: "Export Excel",
    legend: [
      { color: "green", text: "Ratio > 75%" },
      { color: "yellow", text: "50% ≤ Ratio ≤ 75%" },
      { color: "red", text: "Ratio < 50%" },
      { color: "orange", text: "Plan exists" },
      { color: "gray", text: "No data" },
    ],
  },
};

const KPITableReport = ({ groupKey, rows, currentEthYear }) => {
  const { dark } = useThemeStore();
  const [view, setView] = useState("plan");
  const t = translations.en;

  const [goal = "", kra = ""] =
    (typeof groupKey === "string" ? groupKey : "").split("|||").map((s) => s.trim());

  const recentYear = currentEthYear;
  const previousYear = currentEthYear - 1;

  const formatRatio = (perf, target) =>
    typeof perf === "number" && typeof target === "number" && target !== 0
      ? (perf / target) * 100
      : null;

  const getValue = (row, periodKey, type = view) => {
    if (type === "plan") return row.targets?.[periodKey] ?? null;
    if (type === "performance") return row.performance?.[periodKey] ?? null;
    if (type === "ratio") return formatRatio(row.performance?.[periodKey], row.targets?.[periodKey]);
    return null;
  };

  const getCellColor = (type, value, row, periodKey) => {
    if (type === "plan") {
      if (value == null) return dark ? "bg-gray-800" : "bg-gray-200";
      return dark ? "bg-orange-600" : "bg-orange-300";
    }
    if (type === "performance") {
      const ratio = formatRatio(row.performance?.[periodKey], row.targets?.[periodKey]);
      if (ratio == null) return dark ? "bg-gray-800" : "bg-gray-200";
      if (ratio < 50) return dark ? "bg-red-700" : "bg-red-400";
      if (ratio <= 75) return dark ? "bg-yellow-600" : "bg-yellow-300";
      return dark ? "bg-green-700" : "bg-green-400";
    }
    if (type === "ratio") {
      if (value == null) return dark ? "bg-gray-800" : "bg-gray-200";
      if (value < 50) return dark ? "bg-red-700" : "bg-red-400";
      if (value <= 75) return dark ? "bg-yellow-600" : "bg-yellow-300";
      return dark ? "bg-green-700" : "bg-green-400";
    }
    return dark ? "bg-gray-800" : "bg-gray-200";
  };

  const prepareExportData = (viewType) => {
    if (viewType === "all") {
      const arr = [];
      rows.forEach((row) => {
        ["plan", "performance", "ratio"].forEach((type) => {
          arr.push([
            row.kpiName,
            t[type],
            getValue(row, `year-${previousYear}`, type) ?? "-",
            getValue(row, `year-${recentYear}`, type) ?? "-",
            getValue(row, `q1-${recentYear}`, type) ?? "-",
            getValue(row, `q2-${recentYear}`, type) ?? "-",
            getValue(row, `q3-${recentYear}`, type) ?? "-",
            getValue(row, `q4-${recentYear}`, type) ?? "-",
          ]);
        });
      });
      return arr;
    } else {
      return rows.map((row) => [
        row.kpiName,
        getValue(row, `year-${previousYear}`, viewType) ?? "-",
        getValue(row, `year-${recentYear}`, viewType) ?? "-",
        getValue(row, `q1-${recentYear}`, viewType) ?? "-",
        getValue(row, `q2-${recentYear}`, viewType) ?? "-",
        getValue(row, `q3-${recentYear}`, viewType) ?? "-",
        getValue(row, `q4-${recentYear}`, viewType) ?? "-",
      ]);
    }
  };

  const handleExportExcel = () => {
    const headers =
      view === "all"
        ? [t.kpiName, "Type", t.year(previousYear), t.year(recentYear), "Q1", "Q2", "Q3", "Q4"]
        : [t.kpiName, t.year(previousYear), t.year(recentYear), "Q1", "Q2", "Q3", "Q4"];

    const data = prepareExportData(view);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPI Report");
    XLSX.writeFile(wb, `kpi_report_${view}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`KPI Report - ${t[view] || view}`, 14, 10);

    const headers =
      view === "all"
        ? [t.kpiName, "Type", t.year(previousYear), t.year(recentYear), "Q1", "Q2", "Q3", "Q4"]
        : [t.kpiName, t.year(previousYear), t.year(recentYear), "Q1", "Q2", "Q3", "Q4"];

    const data = prepareExportData(view);

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: data,
      styles: { fontSize: 8 },
    });

    doc.save(`kpi_report_${view}.pdf`);
  };

  const borderColor = dark ? "border-gray-700" : "border-gray-300";
  const headerBg = dark ? "bg-gray-800 text-white" : "bg-gray-100 text-[#0D2A5C]";
  const rowHoverBg = dark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const cardBg = dark ? "bg-[#1f2937] text-white" : "bg-white text-[rgba(13,42,92,0.85)]";

  const goalHeaderBg = dark ? "bg-[#b44d12]" : "bg-[#F36F21]";
  const kraHeaderBg = dark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className={`p-6 mb-10 rounded shadow-md ${cardBg}`}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className={`px-3 py-2 rounded text-sm border ${
            dark ? "bg-gray-900 text-white border-gray-600" : "bg-white text-[#0D2A5C] border-gray-300"
          }`}
          title="Select View"
        >
          <option value="plan">🎯 {t.plan}</option>
          <option value="performance">📊 {t.performance}</option>
          <option value="ratio">📈 {t.ratio}</option>
          <option value="all">🧮 {t.all}</option>
        </select>

        <div className="relative group flex items-center gap-2 cursor-default select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span
                  className="w-4 h-4 rounded-full bg-green-600 dark:bg-green-400"
                  title="> 75%"
                />
                <span
                  className="w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-300"
                  title="50% - 75%"
                />
                <span
                  className="w-4 h-4 rounded-full bg-red-600 dark:bg-red-400"
                  title="< 50%"
                />
                <span
                  className="w-4 h-4 rounded-full bg-orange-600 dark:bg-orange-400"
                  title="Plan only"
                />
                <span
                  className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-200 bg-white dark:bg-gray-800"
                  title="No data"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 text-sm font-medium rounded bg-red-600 hover:bg-red-700 text-white"
        >
          📄 {t.exportPDF}
        </button>
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 text-sm font-medium rounded bg-green-600 hover:bg-green-700 text-white"
        >
          📊 {t.exportExcel}
        </button>
      </div>

      <div className={`p-3 font-bold text-sm ${goalHeaderBg} text-white flex items-center gap-2`}>
        🎯 Goal: {goal || "N/A"}
      </div>
      <div
        className={`p-3 font-semibold text-sm ${kraHeaderBg} ${dark ? "text-white" : "text-[#0D2A5C]"} mb-4`}
      >
        🏷️ KRA: {kra || "N/A"}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-xs">
          <thead>
            <tr className={`border-b ${headerBg}`}>
              <th className={`border px-2 py-2 ${borderColor} text-left`}>{t.kpiName}</th>
              {view === "all" && <th className={`border px-2 py-2 ${borderColor}`}>Type</th>}
              <th className={`border px-2 py-2 ${borderColor}`}>{t.year(previousYear)}</th>
              <th className={`border px-2 py-2 ${borderColor}`}>{t.year(recentYear)}</th>
              <th className={`border px-2 py-2 ${borderColor}`}>{t.quarter("Q1")}</th>
              <th className={`border px-2 py-2 ${borderColor}`}>{t.quarter("Q2")}</th>
              <th className={`border px-2 py-2 ${borderColor}`}>{t.quarter("Q3")}</th>
              <th className={`border px-2 py-2 ${borderColor}`}>{t.quarter("Q4")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) =>
              view === "all"
                ? ["plan", "performance", "ratio"].map((type, typeIdx) => (
                    <tr key={`${idx}-${type}`} className={`border-b ${borderColor} ${rowHoverBg}`}>
                      {typeIdx === 0 && (
                        <td className="px-2 py-2 font-medium text-left" rowSpan={3}>
                          {row.kpiName}
                        </td>
                      )}
                      <td className="px-2 py-2 text-center capitalize">{t[type]}</td>
                      {[
                        `year-${previousYear}`,
                        `year-${recentYear}`,
                        `q1-${recentYear}`,
                        `q2-${recentYear}`,
                        `q3-${recentYear}`,
                        `q4-${recentYear}`,
                      ].map((key) => {
                        const rawVal = getValue(row, key, type);
                        const cellColor = getCellColor(type, rawVal, row, key);
                        const displayVal =
                          type === "ratio" && rawVal != null ? `${Math.round(rawVal)}%` : rawVal ?? "-";
                        return (
                          <td key={key} className={`px-2 py-2 text-center ${cellColor}`}>
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                : (
                  <tr key={idx} className={`border-b ${borderColor} ${rowHoverBg}`}>
                    <td className="px-2 py-2 font-medium text-left">{row.kpiName}</td>
                    {[
                      `year-${previousYear}`,
                      `year-${recentYear}`,
                      `q1-${recentYear}`,
                      `q2-${recentYear}`,
                      `q3-${recentYear}`,
                      `q4-${recentYear}`,
                    ].map((key) => {
                      const rawVal = getValue(row, key);
                      const cellColor = getCellColor(view, rawVal, row, key);
                      const displayVal =
                        view === "ratio" && rawVal != null ? `${Math.round(rawVal)}%` : rawVal ?? "-";
                      return (
                        <td key={key} className={`px-2 py-2 text-center ${cellColor}`}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KPITableReport;
