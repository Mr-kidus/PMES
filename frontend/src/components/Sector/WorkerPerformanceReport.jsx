import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPaperclip, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const backendUrl = "http://localhost:1221";

const WorkerPerformanceReport = () => {
  const { user } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);
  const isCEO = user?.role === "CEO";

  const [plans, setPlans] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear() - 8);
  const [quarter, setQuarter] = useState("");
  const [kpiId, setKpiId] = useState("");
  const [kpis, setKpis] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null); // { filename, filepath, url }

  const inputStyle = `px-3 py-2 rounded-md border text-sm ${
    dark ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"
  }`;

  useEffect(() => {
    if (user) {
      fetchKpis();
      if (isCEO) fetchWorkers();
    }
  }, [user]);

  useEffect(() => {
    if ((isCEO && selectedWorker) || (!isCEO && user)) {
      fetchPlans();
    } else if (isCEO && !selectedWorker) {
      // If "All Users" selected (empty string), fetch all users' data
      fetchPlans();
    }
  }, [year, quarter, kpiId, selectedWorker]);

  const fetchKpis = async () => {
    try {
      const subsectorId = user?.subsector?._id || user?.subsector;
      const res = await axios.get(
        `${backendUrl}/api/assign/assigned-kpi-with-goal-details/${subsectorId}`
      );
      const kpisObject = res.data || {};
      const kpiArray = Object.entries(kpisObject).flatMap(([_, goalObj]) =>
        Object.entries(goalObj.kras || {}).flatMap(([_, kraObj]) =>
          kraObj.kpis.map((kpi) => ({
            ...kpi,
            kra_name: kraObj.kra_name,
            goal_desc: goalObj.goal_desc,
          }))
        )
      );
      setKpis(kpiArray);
    } catch (err) {
      console.error("❌ Fetch KPI error:", err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/users/get-users`, {
        withCredentials: true,
      });
      const allUsers = res.data || [];
      const subsectorId = user?.subsector?._id || user?.subsector;

      const filtered = allUsers.filter(
        (u) => u.subsector === subsectorId || u.subsector?._id === subsectorId
      );
      setWorkers(filtered);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  };

 const fetchPlans = async () => {
  try {
    // Safely build only non-empty params
    const filterParams = {
      year,
      ...(quarter ? { quarter } : {}),
      ...(kpiId ? { kpiId } : {}),
      ...(isCEO
        ? selectedWorker
          ? { workerId: selectedWorker }
          : {} // all users
        : { workerId: user?._id }),
    };

    // Fetch assigned KPI plans
    const res = await axios.get(`${backendUrl}/api/worker-plans`, {
      params: filterParams,
      withCredentials: true,
    });
    const plansData = res.data || [];

    // Fetch uploaded performance files
    const fileRes = await axios.get(`${backendUrl}/api/worker-performance/files`, {
      params: filterParams,
      withCredentials: true,
    });
    const filesData = fileRes.data || [];

    // Map files for quick lookup by measureId + year + quarter
    const filesMap = {};
    filesData.forEach((pf) => {
      const key = `${pf.measureId}_${pf.year}_${pf.quarter}`;
      filesMap[key] = pf;
    });

    // Attach comment, file and status to each plan
    const enrichedPlans = plansData.map((plan) => {
      const key = `${plan.measureId}_${plan.year}_${plan.quarter}`;
      const pf = filesMap[key];
      return {
        ...plan,
        comment: pf?.description || "",
        file: pf?.filename && pf.filename !== "no_file" ? pf.filepath : null,
        filename: pf?.filename || "",
        status: pf?.confirmed ? "Done" : "Not Done",
      };
    });

    setPlans(enrichedPlans);
  } catch (err) {
    console.error("❌ Fetch plans or files error:", err);
  }
};


  // Group plans by workerId
  const groupByUser = (plansArray) => {
    return plansArray.reduce((groups, plan) => {
      const userId = plan.workerId || "unknown";
      if (!groups[userId]) groups[userId] = [];
      groups[userId].push(plan);
      return groups;
    }, {});
  };

  // Get user full name or username from workers array by id
  const getUserName = (userId) => {
    if (!userId) return "Unknown User";
    const found = workers.find((w) => w._id === userId);
    return found ? (found.fullName || found.username) : "Unknown User";
  };

  const getFileUrl = (filepath) => {
    if (!filepath || filepath === "no_file") return null;
    const cleanPath = filepath.startsWith("/") ? filepath.slice(1) : filepath;
    return `${backendUrl}/${cleanPath}`;
  };

  // Export Handlers
  const exportToExcel = () => {
    const dataForExcel = plans.map((p) => ({
      KPI: p.kpiName,
      Measure: p.measureName,
      Year: p.year,
      Quarter: p.quarter,
      Target: p.target,
      Justification: p.comment,
      Status: p.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WorkerPerformance");
    XLSX.writeFile(workbook, `worker_performance_${year}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const columns = [
      { header: "KPI", dataKey: "kpiName" },
      { header: "Measure", dataKey: "measureName" },
      { header: "Year", dataKey: "year" },
      { header: "Quarter", dataKey: "quarter" },
      { header: "Target", dataKey: "target" },
      { header: "Justification", dataKey: "comment" },
      { header: "Status", dataKey: "status" },
    ];

    const rows = plans.map((p) => ({
      kpiName: p.kpiName,
      measureName: p.measureName,
      year: p.year,
      quarter: p.quarter,
      target: p.target,
      comment: p.comment,
      status: p.status,
    }));

    autoTable(doc, {
      head: [columns.map((c) => c.header)],
      body: rows.map((r) => columns.map((c) => r[c.dataKey] || "")),
      styles: { fontSize: 8 },
      margin: { top: 20 },
      headStyles: { fillColor: [13, 42, 92] },
    });

    doc.save(`worker_performance_${year}.pdf`);
  };

  // Modal handlers
  const openFileModal = (file) => {
    if (!file) return;
    const url = getFileUrl(file.file);
    setModalFile({ ...file, url });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalFile(null);
  };

  // File type detection
  const isImage = (filename) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(filename);
  const isPdf = (filename) => /\.pdf$/i.test(filename);

  // Group plans by user for rendering
  const plansGroupedByUser = groupByUser(plans);

  return (
    <div
      className={`min-h-screen p-6 ${
        dark ? "bg-[#111827] text-white" : "bg-[#f9fafb] text-gray-800"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">📊 Worker Performance Report</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Year filter */}
        <select
          className={inputStyle}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - 8 - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        {/* Quarter filter */}
        <select
          className={inputStyle}
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
        >
          <option value="">All Quarters</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>

        {/* KPI filter */}
        <select
          className={inputStyle}
          value={kpiId}
          onChange={(e) => setKpiId(e.target.value)}
        >
          <option value="">All KPIs</option>
          {kpis.map((k) => (
            <option key={k._id} value={k._id}>
              {k.kpi_name}
            </option>
          ))}
        </select>

        {/* Worker filter (only for CEO) */}
        {isCEO && (
          <select
            className={inputStyle}
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
          >
            <option value="">All Users</option>
            {workers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.fullName || w.username}
              </option>
            ))}
          </select>
        )}

        {/* Export Buttons */}
        <div className="ml-auto flex gap-3">
          <button
            onClick={exportToExcel}
            title="Export to Excel"
            className={`flex items-center gap-1 px-3 py-2 rounded-md border ${
              dark
                ? "bg-green-800 border-green-600 text-green-200 hover:bg-green-700"
                : "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
            }`}
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={exportToPDF}
            title="Export to PDF"
            className={`flex items-center gap-1 px-3 py-2 rounded-md border ${
              dark
                ? "bg-red-800 border-red-600 text-red-200 hover:bg-red-700"
                : "bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
            }`}
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      {/* Display grouped plans */}
      {plans.length === 0 && (
        <p className="text-center text-gray-500">No report records available.</p>
      )}

      {plans.length > 0 &&
        Object.entries(plansGroupedByUser).map(([userId, userPlans]) => (
          <div
            key={userId}
            className={`mb-8 p-4 rounded-md border border-gray-300 dark:border-gray-700`}
            style={{ borderWidth: "1px" }}
          >
            <h2 className="text-lg font-semibold mb-4">
              {getUserName(userId)}
            </h2>

            <div className="overflow-auto">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead
                  className={dark ? "bg-gray-800 text-white" : "bg-gray-100 text-[#0D2A5C]"}
                >
                  <tr>
                    <th className="px-4 py-2 border">KPI</th>
                    <th className="px-4 py-2 border">Measure</th>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Quarter</th>
                    <th className="px-4 py-2 border">Target</th>
                    <th className="px-4 py-2 border">Justification</th>
                    <th className="px-4 py-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userPlans.map((p, idx) => (
                    <tr
                      key={idx}
                      className={dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                    >
                      <td className="px-4 py-2 border">{p.kpiName}</td>
                      <td className="px-4 py-2 border">{p.measureName}</td>
                      <td className="px-4 py-2 border">{p.year}</td>
                      <td className="px-4 py-2 border">{p.quarter}</td>
                      <td className="px-4 py-2 border">{p.target}</td>
                      <td className="px-4 py-2 border max-w-xs break-words">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm line-clamp-2">{p.comment}</span>
                          {p.file && (
                            <button
                              type="button"
                              onClick={() => openFileModal(p)}
                              className="text-blue-500 underline inline-flex items-center gap-1 cursor-pointer"
                              title={`View file: ${p.filename}`}
                            >
                              <FaPaperclip /> {p.filename}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <span
                          className={`font-semibold ${
                            p.status === "Done" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Modal */}
      {modalOpen && (
        <>
          {/* Background overlay with blur */}
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm z-40"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal content */}
          <div
            className={`fixed top-1/2 left-1/2 max-w-lg w-full max-h-[80vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-md shadow-lg z-50 p-4
              ${
                dark
                  ? "bg-gray-900 text-white border border-gray-700"
                  : "bg-white text-gray-900 border border-gray-300"
              }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold truncate">{modalFile?.filename}</h2>
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className={`text-xl font-bold p-1 rounded hover:bg-gray-300 hover:text-gray-900 transition-colors ${
                  dark ? "hover:bg-gray-700 hover:text-white" : ""
                }`}
              >
                <IoClose />
              </button>
            </div>

            {/* File preview or message */}
            <div className="flex justify-center items-center">
              {modalFile && isImage(modalFile.filename) ? (
                <img
                  src={modalFile.url}
                  alt={modalFile.filename}
                  className="max-w-full max-h-[60vh] rounded"
                />
              ) : modalFile && isPdf(modalFile.filename) ? (
                <iframe
                  src={modalFile.url}
                  title={modalFile.filename}
                  className="w-full h-[60vh]"
                />
              ) : (
                <p className="text-center text-sm italic">
                  No preview available for this file type.
                </p>
              )}
            </div>

            {/* Download button */}
            <div className="mt-4 flex justify-center">
              <a
                href={modalFile?.url}
                target="_blank"
                rel="noopener noreferrer"
                download={modalFile?.filename}
                className={`px-4 py-2 rounded-md text-sm font-semibold ${
                  dark
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-[#F36F21] hover:bg-[#d45c1b] text-white"
                }`}
              >
                Download
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerPerformanceReport;
