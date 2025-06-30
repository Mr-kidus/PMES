function KpiTable({ assignedKPIs }) {
  return (
    <>
      <h3 className="text-xl text-center font-semibold mb-4 text-gray-700 ">
        Assigned KPIs
      </h3>
      <div className="overflow-x-auto">
        <table className="w-[1000px] border-collapse border m-auto border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sector</th>
              <th className="border border-gray-300 px-4 py-2">Subsector</th>
              <th className="border border-gray-300 px-4 py-2">Desk</th>
              <th className="border border-gray-300 px-4 py-2">KRA</th>
              <th className="border border-gray-300 px-4 py-2">KPI</th>
            </tr>
          </thead>
          <tbody>
            {assignedKPIs.map((item, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-gray-300 px-4 py-2">
                  {item.sector}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.subsector}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.desk}
                </td>
                <td className="border border-gray-300 px-4 py-2">{item.kra}</td>
                <td className="border border-gray-300 px-4 py-2">{item.kpi}</td>
              </tr>
            ))}
            {assignedKPIs.length === 0 && (
              <tr>
                <td colSpan="5" className="text-gray-500 py-4">
                  No KPIs assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default KpiTable;
