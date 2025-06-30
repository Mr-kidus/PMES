import React, { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../../store/themeStore";

const BASE_URL = "http://localhost:1221";

function RatioModal({ modalInfo, closeModal }) {
  const dark = useThemeStore((state) => state.dark);

  const [target, setTarget] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!modalInfo) return null;

  let quarter = null;
  let year = null;
  if (modalInfo.field) {
    const parts = modalInfo.field.split("-");
    if (parts.length === 2) {
      if (parts[0].toLowerCase().startsWith("q")) {
        quarter = parts[0].toUpperCase();
        year = parts[1];
      } else if (parts[0].toLowerCase() === "year") {
        year = parts[1];
      }
    }
  }

  const period = quarter ? `${quarter} ${year}` : `Year ${year}`;

  const isValidNumber = (val) =>
    val !== null &&
    val !== undefined &&
    val !== "" &&
    val !== "N/A" &&
    !isNaN(Number(val));

  useEffect(() => {
    if (isValidNumber(modalInfo.target) && isValidNumber(modalInfo.performance)) {
      setTarget(Number(modalInfo.target));
      setPerformance(Number(modalInfo.performance));
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const params = {
          kpiName: modalInfo.kpiName,
          kraId: modalInfo.kraId,
          role: modalInfo.role,
          userId: modalInfo.userId,
          sectorId: modalInfo.sectorId,
          subsectorId: modalInfo.subsectorId,
          year,
        };
        if (quarter) params.quarter = quarter;

        const planRes = await axios.get(`${BASE_URL}/api/plans/target`, { params });
        const perfRes = await axios.get(`${BASE_URL}/api/performance/measure`, { params });

        const fetchedTarget = planRes.data?.target ?? null;
        const fetchedPerformance = perfRes.data?.performanceMeasure ?? null;

        setTarget(isValidNumber(fetchedTarget) ? Number(fetchedTarget) : null);
        setPerformance(isValidNumber(fetchedPerformance) ? Number(fetchedPerformance) : null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch target or performance.");
        setTarget(null);
        setPerformance(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [modalInfo, quarter, year]);

  let ratio = "N/A";
  if (
    isValidNumber(target) &&
    isValidNumber(performance) &&
    Number(target) !== 0
  ) {
    ratio = ((performance / target) * 100).toFixed(2) + "%";
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="ratio-modal-title"
    >
      <div
        className={`w-full max-w-lg rounded-lg shadow-lg p-5 flex flex-col ${
          dark ? "bg-[#1f2937] text-white" : "bg-white text-[#0D2A5C]"
        }`}
      >
        <h2
          id="ratio-modal-title"
          className="text-xl font-semibold mb-5 text-center"
        >
          Performance-to-Target Ratio
        </h2>

        {loading ? (
          <p
            className={`text-center mb-5 ${
              dark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading...
          </p>
        ) : error ? (
          <p className="text-center text-red-600 mb-5 font-semibold">{error}</p>
        ) : (
          <>
            <div className="mb-6 space-y-3 text-sm">
              {[
                { label: "KPI", value: modalInfo.kpiName },
                { label: "Period", value: period },
                {
                  label: "Target",
                  value: target !== null ? target : "N/A",
                },
                {
                  label: "Performance",
                  value: performance !== null ? performance : "N/A",
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label
                    className={`block font-semibold mb-1 ${
                      dark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={value}
                    className={`w-full rounded-md px-3 py-1 border ${
                      dark
                        ? "bg-[#374151] border-gray-600 text-white cursor-not-allowed"
                        : "bg-gray-100 border-gray-300 text-[#0D2A5C] cursor-not-allowed"
                    }`}
                  />
                </div>
              ))}
            </div>

            <p
              className={`text-2xl font-semibold text-center ${
                dark ? "text-green-400" : "text-green-600"
              }`}
            >
              {ratio}
            </p>
          </>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={closeModal}
            className={`px-5 py-2 rounded border transition-colors duration-200 ${
              dark
                ? "border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white"
                : "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatioModal;
