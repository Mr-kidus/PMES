import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";

const backendUrl = "https://pmes-gimp.onrender.com";

const WorkerPlan = () => {
  const { user } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);

  const [plans, setPlans] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear() - 8); // Ethiopic year adjustment
  const [quarter, setQuarter] = useState("");
  const [kpiId, setKpiId] = useState("");
  const [kpis, setKpis] = useState([]);

  const inputStyle = `px-3 py-2 rounded-md border text-sm ${
    dark ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"
  }`;

  const fetchKpis = async () => {
    try {
      const subsectorId = user?.subsector?._id || user?.subsector;
      if (!subsectorId) return;

      const res = await axios.get(
        `${backendUrl}/api/assign/assigned-kpi-with-goal-details/${subsectorId}`
      );

      const kpisObject = res.data || {};
      const kpiArray = Object.entries(kpisObject).flatMap(([_, goalObj]) => {
        return Object.entries(goalObj.kras || {}).flatMap(([_, kraObj]) => {
          return kraObj.kpis.map((kpi) => ({
            ...kpi,
            kra_name: kraObj.kra_name,
            goal_desc: goalObj.goal_desc,
          }));
        });
      });

      setKpis(kpiArray);
    } catch (err) {
      console.error("❌ Fetch KPI error:", err);
      setKpis([]);
    }
  };

 const fetchPlans = async () => {
  try {
    if (!user?._id) return;

    const params = {
      workerId: user._id, // always send user ID
      year,
      quarter,
      kpiId,
    };

    const res = await axios.get(`${backendUrl}/api/worker-plans`, {
      params,
      withCredentials: true,
    });
    setPlans(res.data);
  } catch (err) {
    console.error("❌ Fetch plans error:", err);
    setPlans([]);
  }
};


  useEffect(() => {
    if (user) fetchKpis();
  }, [user]);

  useEffect(() => {
    fetchPlans();
  }, [year, quarter, kpiId]);

  return (
    <div
      className={`min-h-screen p-6 ${
        dark ? "bg-[#111827] text-white" : "bg-[#f9fafb] text-gray-800"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">📋 Plans</h1>

      <div className="flex flex-wrap gap-4 mb-6">
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
      </div>

      <div className="rounded-xl shadow-md overflow-auto border border-gray-300 dark:border-gray-700">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead
            className={dark ? "bg-gray-800 text-white" : "bg-gray-100 text-[#0D2A5C]"}
          >
            <tr>
              <th className="px-4 py-2 border">KPI Name</th>
              <th className="px-4 py-2 border">Measure</th>
              <th className="px-4 py-2 border">Year</th>
              <th className="px-4 py-2 border">Quarter</th>
              <th className="px-4 py-2 border">Target</th>
            </tr>
          </thead>
          <tbody>
            {plans.length ? (
              plans.map((p, idx) => (
                <tr
                  key={idx}
                  className={dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                >
                  <td className="px-4 py-2 border">{p.kpiName}</td>
                  <td className="px-4 py-2 border">{p.measureName}</td>
                  <td className="px-4 py-2 border">{p.year}</td>
                  <td className="px-4 py-2 border">{p.quarter}</td>
                  <td className="px-4 py-2 border">{p.target}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No plans found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerPlan;
