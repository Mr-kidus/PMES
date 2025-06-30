function DataTable({ goals, kras, kpis, searchTerm }) {
  const filteredGoals = goals.filter((goal) =>
    goal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
  );
}

export default DataTable;
