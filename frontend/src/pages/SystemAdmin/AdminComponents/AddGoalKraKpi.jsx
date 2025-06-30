import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useEffect, useRef, useState } from "react";

Chart.register(...registerables, ChartDataLabels);

function AddGoalKraKpi() {
  const chartRef = useRef(null);
  const [goals, setGoals] = useState(
    JSON.parse(localStorage.getItem("goals")) || []
  );
  const [kras, setKras] = useState(
    JSON.parse(localStorage.getItem("kras")) || []
  );
  const [kpis, setKpis] = useState(
    JSON.parse(localStorage.getItem("kpis")) || []
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [newGoal, setNewGoal] = useState("");
  const [newKra, setNewKra] = useState("");
  const [kraGoalId, setKraGoalId] = useState("");
  const [newKpi, setNewKpi] = useState("");
  const [kpiGoalId, setKpiGoalId] = useState("");
  const [kpiKraId, setKpiKraId] = useState("");

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
    localStorage.setItem("kras", JSON.stringify(kras));
    localStorage.setItem("kpis", JSON.stringify(kpis));
  }, [goals, kras, kpis]);

  // Chart update
  const updateChart = () => {
    const ctx = document.getElementById("countChart").getContext("2d");

    // Destroy previous chart if exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const newChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Goals", "KRAs", "KPIs"],
        datasets: [
          {
            data: [goals.length, kras.length, kpis.length],
            backgroundColor: ["#007bff", "#ffc107", "#28a745"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          datalabels: {
            color: "#fff",
            formatter: (value) => value,
            font: { weight: "bold", size: 14 },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    chartRef.current = newChart;
  };

  useEffect(() => {
    updateChart();
  }, [goals, kras, kpis]);

  // Handlers
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now(), name: newGoal.trim() }]);
      setNewGoal("");
    }
  };

  const handleAddKRA = () => {
    if (newKra.trim() && kraGoalId) {
      setKras([
        ...kras,
        { id: Date.now(), name: newKra.trim(), goalId: kraGoalId },
      ]);
      setNewKra("");
      setKraGoalId("");
    }
  };

  const handleAddKPI = () => {
    if (newKpi.trim() && kpiKraId) {
      setKpis([
        ...kpis,
        { id: Date.now(), name: newKpi.trim(), kraId: kpiKraId },
      ]);
      setNewKpi("");
      setKpiKraId("");
      setKpiGoalId("");
    }
  };

  // Filtered
  const filteredGoals = goals.filter((goal) =>
    goal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKras = kras.filter((kra) =>
    kra.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKpis = kpis.filter((kpi) =>
    kpi.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        Goal, KRA, KPI Manager
      </h2>

      {/* Register Goal */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Register Goal</h3>
        <input
          type="text"
          placeholder="Goal Name"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="border p-2 rounded-md mb-2 w-full"
        />
        <button
          onClick={handleAddGoal}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Goal
        </button>
      </div>

      {/* Register KRA */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Register KRA</h3>
        <select
          className="border p-2 rounded-md mb-2 w-full"
          value={kraGoalId}
          onChange={(e) => setKraGoalId(e.target.value)}
        >
          <option value="">Select Goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="KRA Name"
          value={newKra}
          onChange={(e) => setNewKra(e.target.value)}
          className="border p-2 rounded-md mb-2 w-full"
        />
        <button
          onClick={handleAddKRA}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Add KRA
        </button>
      </div>

      {/* Register KPI */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Register KPI</h3>
        <select
          className="border p-2 rounded-md mb-2 w-full"
          value={kpiGoalId}
          onChange={(e) => setKpiGoalId(e.target.value)}
        >
          <option value="">Select Goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
        <select
          className="border p-2 rounded-md mb-2 w-full"
          value={kpiKraId}
          onChange={(e) => setKpiKraId(e.target.value)}
        >
          <option value="">Select KRA</option>
          {kras
            .filter((k) => k.goalId === kpiGoalId)
            .map((kra) => (
              <option key={kra.id} value={kra.id}>
                {kra.name}
              </option>
            ))}
        </select>
        <input
          type="text"
          placeholder="KPI Name"
          value={newKpi}
          onChange={(e) => setNewKpi(e.target.value)}
          className="border p-2 rounded-md mb-2 w-full"
        />
        <button
          onClick={handleAddKPI}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add KPI
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <canvas id="countChart"></canvas>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Goal, KRA, or KPI"
        className="border p-2 rounded-md w-full mb-6"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="border p-2">Goal</th>
              <th className="border p-2">KRA</th>
              <th className="border p-2">KPI</th>
            </tr>
          </thead>
          <tbody>
            {filteredGoals.map((goal) => (
              <tr key={goal.id}>
                <td className="border p-2">{goal.name}</td>
                <td className="border p-2">
                  {kras
                    .filter((kra) => kra.goalId === goal.id)
                    .map((kra) => kra.name)
                    .join(", ")}
                </td>
                <td className="border p-2">
                  {kpis
                    .filter((kpi) =>
                      kras.some(
                        (kra) => kra.goalId === goal.id && kra.id === kpi.kraId
                      )
                    )
                    .map((kpi) => kpi.name)
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddGoalKraKpi;
