function KPIForm({
  goals,
  kras,
  kpiGoalId,
  setKpiGoalId,
  kpiKraId,
  setKpiKraId,
  newKpi,
  setNewKpi,
  handleAddKPI,
}) {
  return (
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
  );
}

export default KPIForm;
