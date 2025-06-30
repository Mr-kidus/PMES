import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:1221";

const AddGoalKraKpi = () => {
  const [goalDesc, setGoalDesc] = useState("");
  const [kraName, setKraName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [kpiName, setKpiName] = useState("");
  const [selectedKRA, setSelectedKRA] = useState("");

  const [goals, setGoals] = useState([]);
  const [kras, setKras] = useState([]);
  const [kpiData, setKpiData] = useState([]); // nested Goal->KRA->KPI data

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/kpis2/get-kpi2`);
      const { data } = res.data;

      const uniqueGoals = data.map((goal) => ({
        _id: goal._id,
        goal_desc: goal.goal_desc,
      }));

      const allKras = data.flatMap((goal) =>
        goal.kras.map((kra) => ({
          _id: kra._id,
          kra_name: kra.kra_name,
          goalId: goal._id,
        }))
      );

      setGoals(uniqueGoals);
      setKras(allKras);
      setKpiData(data);
    } catch (err) {
      console.error("Error fetching KPI data", err);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalDesc.trim()) return alert("Enter goal description");

    try {
      await axios.post(`${API_BASE}/api/goal2/create-goal2`, {
        goal_desc: goalDesc,
      });
      alert("✅ Goal created!");
      setGoalDesc("");
      fetchAllData();
    } catch {
      alert("❌ Failed to create goal");
    }
  };

const handleKRASubmit = async (e) => {
  e.preventDefault();
  if (!kraName.trim()) return alert("Enter KRA name");
  if (!selectedGoal) return alert("Select a goal");

  const kraPayload = { kra_name: kraName, goalId: selectedGoal };
  console.log("Sending KRA:", kraPayload); // 🔍 Debug log

  try {
    await axios.post(`${API_BASE}/api/kras2/create-kra2`, kraPayload);
    alert("✅ KRA created!");
    setKraName("");
    setSelectedGoal("");
    fetchAllData();
  } catch {
    alert("❌ Failed to create KRA");
  }
};


  const handleKPISubmit = async (e) => {
    e.preventDefault();
    if (!kpiName.trim()) return alert("Enter KPI name");
    if (!selectedKRA) return alert("Select a KRA");

    const kra = kras.find((k) => k._id === selectedKRA);
    if (!kra || !kra.goalId) return alert("Invalid KRA selected");

    try {
      await axios.post(`${API_BASE}/api/kpis2/create-kpi2`, {
        kpi_name: kpiName,
        kraId: selectedKRA,
        goalId: kra.goalId,
      });
      alert("✅ KPI created!");
      setKpiName("");
      setSelectedKRA("");
      fetchAllData();
    } catch {
      alert("❌ Failed to create KPI");
    }
  };

  const chartData = kpiData.map((goal) => ({
    goal: goal.goal_desc,
    KRAs: goal.kras.length,
    KPIs: goal.kras.reduce((acc, kra) => acc + kra.kpis.length, 0),
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleGoalSubmit} className="space-y-4 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">➕ Create Goal</h2>
          <input
            type="text"
            placeholder="Goal Description"
            value={goalDesc}
            onChange={(e) => setGoalDesc(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Create Goal
          </button>
        </form>

        <form onSubmit={handleKRASubmit} className="space-y-4 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">➕ Create KRA</h2>
          <input
            type="text"
            placeholder="KRA Name"
            value={kraName}
            onChange={(e) => setKraName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <select
  value={selectedGoal}
  onChange={(e) => {
    console.log("Goal selected:", e.target.value);
    setSelectedGoal(e.target.value);
  }}
  className="w-full border p-2 rounded"
>
  <option value="">-- Select Goal --</option>
  {goals.map((goal) => (
    <option key={goal._id} value={goal._id}>
      {goal.goal_desc}
    </option>
  ))}
</select>

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Create KRA
          </button>
        </form>

        <form onSubmit={handleKPISubmit} className="space-y-4 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">➕ Create KPI</h2>
          <input
            type="text"
            placeholder="KPI Name"
            value={kpiName}
            onChange={(e) => setKpiName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <select
            value={selectedKRA}
            onChange={(e) => setSelectedKRA(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select KRA --</option>
            {kras.map((kra) => (
              <option key={kra._id} value={kra._id}>
                {kra.kra_name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
            Create KPI
          </button>
        </form>
      </div>

      {/* Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Goals - KRAs - KPIs Table</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 p-2">Goal</th>
              <th className="border border-gray-300 p-2">KRA</th>
              <th className="border border-gray-300 p-2">KPIs</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4">
                  No data available.
                </td>
              </tr>
            ) : (
              kpiData.map((goal) => {
                const totalRows = goal.kras.reduce(
                  (acc, kra) => acc + Math.max(kra.kpis.length, 1),
                  0
                );

                const rows = [];
                let goalRendered = false;

                if (goal.kras.length === 0) {
                  rows.push(
                    <tr key={`goal-${goal._id}`}>
                      <td className="border border-gray-300 p-2 font-semibold">
                        {goal.goal_desc}
                      </td>
                      <td colSpan="2" className="border border-gray-300 p-2 italic text-gray-500">
                        No KRAs
                      </td>
                    </tr>
                  );
                } else {
                  goal.kras.forEach((kra) => {
                    if (kra.kpis.length === 0) {
                      rows.push(
                        <tr key={`kra-${kra._id}`}>
                          {!goalRendered && (
                            <td
                              rowSpan={totalRows}
                              className="border border-gray-300 p-2 align-top font-semibold"
                            >
                              {goal.goal_desc}
                            </td>
                          )}
                          <td className="border border-gray-300 p-2">{kra.kra_name}</td>
                          <td className="border border-gray-300 p-2 italic text-gray-500">
                            No KPIs
                          </td>
                        </tr>
                      );
                      goalRendered = true;
                    } else {
                      kra.kpis.forEach((kpi, idx) => {
                        rows.push(
                          <tr key={`kpi-${kpi._id}`}>
                            {!goalRendered && idx === 0 && (
                              <td
                                rowSpan={totalRows}
                                className="border border-gray-300 p-2 align-top font-semibold"
                              >
                                {goal.goal_desc}
                              </td>
                            )}
                            {idx === 0 && (
                              <td rowSpan={kra.kpis.length} className="border border-gray-300 p-2">
                                {kra.kra_name}
                              </td>
                            )}
                            <td className="border border-gray-300 p-2">{kpi.kpi_name}</td>
                          </tr>
                        );
                        goalRendered = true;
                      });
                    }
                  });
                }

                return rows;
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Goals Summary Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="goal" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="KRAs" fill="#82ca9d" />
            <Bar dataKey="KPIs" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AddGoalKraKpi;
