import React, { useState, useEffect } from "react";
import axios from "axios";
import useThemeStore from "../../store/themeStore";

const BASE_URL = "http://localhost:1221";

function PerformanceModal({ modalInfo, closeModal, handleFormSubmit }) {
  const dark = useThemeStore((state) => state.dark);

  const [performanceMeasure, setPerformanceMeasure] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [validationStatus, setValidationStatus] = useState("Pending");

  useEffect(() => {
    let quarter = null;
    let year = null;
    if (modalInfo.period) {
      const parts = modalInfo.period.split("-");
      if (parts.length === 2) {
        if (parts[0].toLowerCase().startsWith("q")) {
          quarter = parts[0].toUpperCase();
          year = parts[1];
        } else if (parts[0].toLowerCase() === "year") {
          year = parts[1];
        }
      }
    }

    async function fetchData() {
  if (
    !modalInfo.kpiName ||
    !modalInfo.kraId ||
    !modalInfo.role ||
    !modalInfo.userId ||
    !year
  ) {
    setWarning(
      "Missing required data to fetch: " +
        [
          !modalInfo.kpiName && "kpiName",
          !modalInfo.kraId && "kraId",
          !modalInfo.role && "role",
          !modalInfo.userId && "userId",
          !year && "year",
        ]
          .filter(Boolean)
          .join(", ")
    );
    setPerformanceMeasure("");
    setDescription("");
    setTarget("");
    setError("");
    setLoading(false);
    return;
  }

  setWarning("");
  setLoading(true);

  try {
    const planParams = {
      kpiName: modalInfo.kpiName,
      kraId: modalInfo.kraId,
      role: modalInfo.role,
      sectorId: modalInfo.sectorId,
      subsectorId: modalInfo.subsectorId,
      userId: modalInfo.userId,
      year,
    };
    if (quarter) planParams.quarter = quarter;

    const planRes = await axios.get(`${BASE_URL}/api/plans/target`, {
      params: planParams,
    });
    const fetchedTarget = planRes.data?.target?.toString() || "";
    setTarget(fetchedTarget);

    const perfRes = await axios.get(`${BASE_URL}/api/performance/measure`, {
      params: planParams,
    });
    const perfData = perfRes.data || {};

    // Log fetched performance data including quarterly values
    console.log(
      `[PerformanceModal] Fetched performance data for KPI "${modalInfo.kpiName}", period "${modalInfo.period}":`,
      perfData
    );

    setPerformanceMeasure(perfData.performanceMeasure?.toString() || "");
    setDescription(perfData.description || "");
    setValidationStatus(
      perfData.validationStatus ?? perfData.validationStatusYear ?? "Pending"
    );
    setError("");
  } catch {
    setPerformanceMeasure("");
    setDescription("");
    setTarget("");
    setError("Could not fetch performance or target for this period.");
  } finally {
    setLoading(false);
  }
}


    fetchData();
  }, [modalInfo]);

  let quarter = null;
  let year = null;
  if (modalInfo.period) {
    const parts = modalInfo.period.split("-");
    if (parts.length === 2) {
      if (parts[0].toLowerCase().startsWith("q")) {
        quarter = parts[0].toUpperCase();
        year = parts[1];
      } else if (parts[0].toLowerCase() === "year") {
        year = parts[1];
      }
    }
  }

  const handlePerformanceChange = (e) => {
    setPerformanceMeasure(e.target.value);
    setError("");
    setWarning("");
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setWarning("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (loading || warning) return;
    if (performanceMeasure === "") {
      setError("Performance measure is required.");
      return;
    }
    const perfValue = parseFloat(performanceMeasure);
    if (isNaN(perfValue)) {
      setError("Please enter a valid number for performance measure.");
      return;
    }
    const data = {
      ...modalInfo,
      year,
      quarter,
      performanceMeasure: perfValue,
      description,
    };
    handleFormSubmit(data);
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="performance-modal-title"
    >
      <div
        className={`w-full max-w-lg rounded-lg shadow-lg p-5 flex flex-col ${
          dark ? "bg-[#1f2937] text-white" : "bg-white text-[#0D2A5C]"
        }`}
      >
        <h2
          id="performance-modal-title"
          className="text-xl font-semibold mb-4 text-center"
        >
          Enter KPI Performance
        </h2>

        {loading && (
          <p className="text-blue-400 font-semibold mb-2 text-center">
            Loading performance data...
          </p>
        )}

        {warning && (
          <p
            className="mb-3 font-semibold p-2 rounded text-yellow-700 bg-yellow-100 text-center"
            role="alert"
          >
            {warning}
          </p>
        )}

        <div className="flex justify-end mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
              validationStatus === "Approved"
                ? "bg-green-100 text-green-700 border-green-400"
                : "bg-yellow-100 text-yellow-700 border-yellow-400"
            }`}
          >
            {validationStatus}
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-sm" noValidate>
          <div>
            <label htmlFor="kpiName" className="block mb-1 font-semibold">
              KPI Name
            </label>
            <input
              id="kpiName"
              type="text"
              readOnly
              value={modalInfo.kpiName || ""}
              className={`w-full rounded-md px-3 py-1 border ${
                dark
                  ? "bg-[#374151] border-gray-600 text-white cursor-not-allowed"
                  : "bg-gray-100 border-gray-300 text-[#0D2A5C] cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label htmlFor="period" className="block mb-1 font-semibold">
              {quarter ? "Quarter" : "Year"}
            </label>
            <input
              id="period"
              type="text"
              readOnly
              value={quarter ? `${quarter} ${year}` : year}
              className={`w-full rounded-md px-3 py-1 border ${
                dark
                  ? "bg-[#374151] border-gray-600 text-white cursor-not-allowed"
                  : "bg-gray-100 border-gray-300 text-[#0D2A5C] cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label htmlFor="target" className="block mb-1 font-semibold">
              Target
            </label>
            <input
              id="target"
              type="number"
              readOnly
              value={target}
              className={`w-full rounded-md px-3 py-1 border ${
                dark
                  ? "bg-[#374151] border-gray-600 text-white cursor-not-allowed"
                  : "bg-gray-100 border-gray-300 text-[#0D2A5C] cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="performanceMeasure"
              className="block mb-1 font-semibold"
            >
              Performance Measure
            </label>
            <input
              id="performanceMeasure"
              type="number"
              min="0"
              step="any"
              value={performanceMeasure}
              onChange={handlePerformanceChange}
              className={`w-full rounded-md px-3 py-1 border focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-[#374151] border-gray-600 text-white focus:ring-[#F36F21]"
                  : "bg-white border-gray-300 text-[#0D2A5C] focus:ring-[#0D2A5C]"
              }`}
              placeholder="Enter actual performance"
              required
              disabled={loading || !!warning || validationStatus === "Approved"}
            />
            {error && (
              <p className="text-red-600 text-xs mt-1 font-semibold">{error}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-semibold">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              rows={2}
              placeholder="Enter performance description"
              className={`w-full rounded-md px-3 py-1 border resize-none focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-[#374151] border-gray-600 text-white focus:ring-[#F36F21]"
                  : "bg-white border-gray-300 text-[#0D2A5C] focus:ring-[#0D2A5C]"
              }`}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-2 flex-wrap">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className={`px-4 py-2 rounded border transition-colors duration-200 ${
                dark
                  ? "text-gray-300 border-gray-600 hover:bg-gray-700"
                  : "text-gray-600 border-gray-300 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || !!error || !!warning || validationStatus === "Approved"
              }
              className={`px-4 py-2 rounded bg-green-600 text-white transition-colors duration-200 hover:bg-green-700 ${
                loading ? "opacity-70 cursor-wait" : ""
              }`}
            >
              {loading ? "Loading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PerformanceModal;
