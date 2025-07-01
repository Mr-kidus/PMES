import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPaperclip } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = "https://pmes-gimp.onrender.com";

const WorkerPerformanceSubmission = () => {
  const { user } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);

  const [plans, setPlans] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear() - 8);
  const [quarter, setQuarter] = useState("");
  const [kpiId, setKpiId] = useState("");
  const [kpis, setKpis] = useState([]);

  const [comments, setComments] = useState({});
  const [files, setFiles] = useState({});
  const [checked, setChecked] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);

  const inputStyle = `px-3 py-2 rounded-md border text-sm ${
    dark ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"
  }`;

  useEffect(() => {
    if (user) fetchKpis();
  }, [user]);

  useEffect(() => {
    if (user?._id && year && quarter !== undefined) fetchPlans();
  }, [year, quarter, kpiId]);

  async function fetchKpis() {
    try {
      const subsectorId = user?.subsector?._id || user?.subsector;
      const res = await axios.get(
        `${backendUrl}/api/assign/assigned-kpi-with-goal-details/${subsectorId}`
      );
      const kpisObject = res.data || {};
      const kpiArray = Object.entries(kpisObject).flatMap(([goalId, goalObj]) =>
        Object.entries(goalObj.kras || {}).flatMap(([kraId, kraObj]) =>
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
      toast.error("Failed to load KPIs.");
    }
  }

  async function fetchPlans() {
    try {
      const res = await axios.get(`${backendUrl}/api/worker-plans`, {
        params: {
          year,
          quarter,
          kpiId,
          workerId: user?._id,
        },
        withCredentials: true,
      });
      const plansData = res.data || [];
      setPlans(plansData);

      const fileRes = await axios.get(`${backendUrl}/api/worker-performance/files`, {
        params: {
          workerId: user?._id,
          year,
          quarter,
          kpiId,
        },
        withCredentials: true,
      });
      const filesData = fileRes.data || [];

      const filesMap = {};
      filesData.forEach((pf) => {
        const key = `${pf.measureId}_${pf.year}_${pf.quarter}`;
        filesMap[key] = pf;
      });

      const newComments = {};
      const newChecked = {};
      const newFiles = {};

      plansData.forEach((plan, idx) => {
        const key = `${plan.measureId}_${plan.year}_${plan.quarter}`;
        const pf = filesMap[key];
        if (pf) {
          newComments[idx] = pf.description || "";
          newChecked[idx] = !!pf.confirmed;
          if (pf.filename && pf.filename !== "no_file" && pf.filepath) {
            newFiles[idx] = {
              filename: pf.filename,
              filepath: pf.filepath,
            };
          } else {
            newFiles[idx] = null;
          }
        } else {
          newComments[idx] = "";
          newChecked[idx] = false;
          newFiles[idx] = null;
        }
      });

      setComments(newComments);
      setChecked(newChecked);
      setFiles(newFiles);
    } catch (err) {
      console.error("❌ Fetch plans or files error:", err);
      toast.error("Failed to load performance plans or files.");
    }
  }

  const getFileUrl = (filepath) => {
    if (!filepath || filepath === "no_file") return null;
    const cleanPath = filepath.startsWith("/") ? filepath.slice(1) : filepath;
    return `${backendUrl}/${cleanPath}`;
  };

  const onFileChange = (idx, event) => {
    const selectedFile = event.target.files[0];
    setFiles((prev) => ({
      ...prev,
      [idx]: selectedFile
        ? { fileObj: selectedFile, filename: selectedFile.name }
        : null,
    }));
  };

  // Validation logic:
  // If checked: require comment and file.
  // If unchecked: no comment or file needed.
  const validateBeforeSubmit = (plan, idx) => {
    if (!plan.measureId) {
      toast.error("Measure ID missing. Cannot submit.");
      return false;
    }
    if (!plan.quarter) {
      toast.error("Quarter missing in the plan.");
      return false;
    }
    if (checked[idx]) {
      if (!comments[idx]?.trim()) {
        toast.error("Comment is required when submitting.");
        return false;
      }
      // File required if no previous file and none selected now
      if (!files[idx]) {
        toast.error("File is required when submitting.");
        return false;
      }
    }
    return true;
  };

  const handleSave = async (plan, idx) => {
    if (!validateBeforeSubmit(plan, idx)) return;

    const isChecked = !!checked[idx];
    const comment = comments[idx] || "";
    const file = files[idx]?.fileObj || null;

    const formData = new FormData();
    formData.append("measureId", plan.measureId);
    formData.append("kpiId", plan.kpiId || kpiId);
    formData.append("year", plan.year);
    formData.append("quarter", plan.quarter);
    formData.append("value", plan.target); // always positive
    formData.append("description", comment);
    formData.append("sectorId", user?.sector?._id || user?.sector);
    formData.append("subsectorId", user?.subsector?._id || user?.subsector);
    formData.append("workerId", user?._id);
    formData.append("confirmed", isChecked ? "true" : "false");

    if (file) formData.append("file", file);

    try {
      await axios.post(`${backendUrl}/api/worker-performance/submit-performance`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Submitted successfully!");
      fetchPlans();
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error(
        `Submission failed: ${err.response?.data?.message || err.message || "Server error"}`
      );
    }
  };

  const openFileModal = (file) => {
    if (!file) return;
    const url = getFileUrl(file.filepath);
    setModalFile({ ...file, url });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalFile(null);
  };

  const isImage = (filename) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(filename);
  const isPdf = (filename) => /\.pdf$/i.test(filename);

  return (
    <div
      className={`min-h-screen p-6 ${
        dark ? "bg-[#111827] text-white" : "bg-[#f9fafb] text-gray-800"
      }`}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-bold mb-4">📈 Performance</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select className={inputStyle} value={year} onChange={(e) => setYear(e.target.value)}>
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - 8 - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <select className={inputStyle} value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          <option value="">All Quarters</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>

        <select className={inputStyle} value={kpiId} onChange={(e) => setKpiId(e.target.value)}>
          <option value="">All KPIs</option>
          {kpis.map((k) => (
            <option key={k._id} value={k._id}>
              {k.kpi_name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead className={dark ? "bg-gray-800 text-white" : "bg-gray-100 text-[#0D2A5C]"}>
            <tr>
              <th className="px-4 py-2 border">KPI</th>
              <th className="px-4 py-2 border">Measure</th>
              <th className="px-4 py-2 border">Year</th>
              <th className="px-4 py-2 border">Quarter</th>
              <th className="px-4 py-2 border">Target</th>
              <th className="px-4 py-2 border">Justification</th>
              <th className="px-4 py-2 border">Check</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length ? (
              plans.map((p, idx) => {
                const fileData = files[idx];
                const fileName = fileData?.filename || "";

                return (
                  <tr key={idx} className={dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                    <td className="px-4 py-2 border">{p.kpiName}</td>
                    <td className="px-4 py-2 border">{p.measureName}</td>
                    <td className="px-4 py-2 border">{p.year}</td>
                    <td className="px-4 py-2 border">{p.quarter}</td>
                    <td className="px-4 py-2 border">{p.target}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center gap-2">
                        <textarea
                          className={`${inputStyle} h-10 w-40 resize-none`}
                          placeholder="Comment"
                          value={comments[idx] || ""}
                          onChange={(e) =>
                            setComments({ ...comments, [idx]: e.target.value })
                          }
                          disabled={!checked[idx]} // disable if unchecked
                        />
                        <label
                          htmlFor={`file-${idx}`}
                          className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md shadow-sm ${
                            dark
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          } ${!checked[idx] ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <FaPaperclip />
                          {fileName ? (
                            <button
                              type="button"
                              onClick={() => openFileModal(fileData)}
                              className="underline ml-1"
                            >
                              {fileName}
                            </button>
                          ) : (
                            "File"
                          )}
                        </label>
                        <input
                          type="file"
                          id={`file-${idx}`}
                          className="hidden"
                          onChange={(e) => onFileChange(idx, e)}
                          disabled={!checked[idx]}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={checked[idx] || false}
                          onChange={(e) =>
                            setChecked({ ...checked, [idx]: e.target.checked })
                          }
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition-colors duration-300 peer-focus:ring-4 ${
                            dark
                              ? "bg-gray-700 peer-focus:ring-orange-800 peer-checked:bg-orange-600"
                              : "bg-gray-300 peer-focus:ring-orange-300 peer-checked:bg-[#F36F21]"
                          }`}
                        />
                        <div
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                            dark ? "bg-gray-200 peer-checked:translate-x-5" : "bg-white peer-checked:translate-x-5"
                          }`}
                        />
                      </label>
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        className="bg-[#F36F21] text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => handleSave(p, idx)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No performance records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm z-40"
            onClick={closeModal}
            aria-hidden="true"
          />
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
            <div className="flex justify-center items-center">
              {modalFile && /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(modalFile.filename) ? (
                <img
                  src={modalFile.url}
                  alt={modalFile.filename}
                  className="max-w-full max-h-[60vh] rounded"
                />
              ) : modalFile && /\.pdf$/i.test(modalFile.filename) ? (
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

export default WorkerPerformanceSubmission;
