import React, { useState, useEffect } from "react";
import axios from "axios";
import useThemeStore from "../../store/themeStore";

const BASE_URL = "http://localhost:1221";

function PlanModal({ modalInfo, closeModal, handleFormSubmit }) {
  const dark = useThemeStore((state) => state.dark);

  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [validationStatus, setValidationStatus] = useState("Pending");

  let quarter = null;
  let year = null;
  if (modalInfo.period) {
    const parts = modalInfo.period.split("-");
    if (parts.length === 2) {
      if (parts[0].toLowerCase().startsWith("q")) {
        quarter = parts[0].toLowerCase();
        year = parts[1];
      } else {
        year = parts[1];
      }
    }
  }

  useEffect(() => {
    const fetchTarget = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          kpiName: modalInfo.kpiName || "",
          kraId:
            typeof modalInfo.kraId === "object"
              ? modalInfo.kraId._id || ""
              : modalInfo.kraId || "",
          role: modalInfo.role || "",
          sectorId:
            typeof modalInfo.sectorId === "object"
              ? modalInfo.sectorId._id || ""
              : modalInfo.sectorId || "",
          subsectorId:
            typeof modalInfo.subsectorId === "object"
              ? modalInfo.subsectorId._id || ""
              : modalInfo.subsectorId || undefined,
          userId: modalInfo.userId || "",
          year: year || "",
          quarter: quarter || undefined,
        };

        const res = await axios.get(`${BASE_URL}/api/plans/target`, { params });
        setTarget(res.data?.target?.toString() || "");
        setValidationStatus(
          res.data?.validationStatus ?? res.data?.validationStatusYear ?? "Pending"
        );
      } catch (err) {
        setError("Error fetching target.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTarget();
  }, [modalInfo, year, quarter]);

  const handleTargetChange = (e) => {
    setTarget(e.target.value);
    setError("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (loading || !!error || !!warning) return;
    if (validationStatus === "Approved") return;
    if (target === "" || isNaN(Number(target))) {
      setError("Please enter a valid target.");
      return;
    }

    if (typeof handleFormSubmit !== "function") {
      console.error("handleFormSubmit is not a function");
      return;
    }

    handleFormSubmit({
      ...modalInfo,
      target: Number(target),
      year,
      quarter,
    });
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="plan-modal-title"
    >
      <div
        className={`w-full max-w-lg rounded-lg shadow-lg p-5 flex flex-col ${
          dark ? "bg-[#1f2937] text-white" : "bg-white text-[#0D2A5C]"
        }`}
      >
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

        <h2
          id="plan-modal-title"
          className="text-xl font-semibold mb-4 text-center"
        >
          Edit KPI Target
        </h2>

        {warning && (
          <p
            className="mb-3 font-semibold p-2 rounded text-yellow-700 bg-yellow-100 text-center"
            role="alert"
          >
            {warning}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-sm" noValidate>
          <div>
            <label className="block mb-1 font-semibold">KPI Name</label>
            <input
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
            <label className="block mb-1 font-semibold">
              {quarter ? "Quarter" : "Year"}
            </label>
            <input
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
            <label className="block mb-1 font-semibold">Target</label>
            <input
              type="number"
              min="0"
              step="any"
              value={target}
              onChange={handleTargetChange}
              className={`w-full rounded-md px-3 py-1 border focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-[#374151] border-gray-600 text-white focus:ring-[#F36F21]"
                  : "bg-white border-gray-300 text-[#0D2A5C] focus:ring-[#0D2A5C]"
              }`}
              required
              disabled={loading || !!warning || validationStatus === "Approved"}
            />
            {error && (
              <p className="text-red-600 text-xs mt-1 font-semibold">{error}</p>
            )}
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

export default PlanModal;
