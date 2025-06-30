import React, { useEffect, useState } from "react";
import KPITable from "./Table/KPITable";

function AssignedKpisTable({ sectorId, openModal }) {
  const [groupedKpis, setGroupedKpis] = useState({});

  // Helper: group by goal||kra keys
  function groupByGoalAndKra(data) {
    // data is the array of assigned KPI objects from your backend

    const groups = {};

    data.forEach((item) => {
      const goal = item.kraId?.goalId?.goal_desc || "N/A";
      const kra = item.kraId?.kra_name || "N/A";

      const groupKey = `${goal}||${kra}`;

      if (!groups[groupKey]) groups[groupKey] = [];

      groups[groupKey].push({
        kpiId: item.kpiId?._id || "",
        kpiName: item.kpiId?.kpi_name || "",
        year: item.year || "N/A",
        q1: item.q1 || "N/A",
        q2: item.q2 || "N/A",
        q3: item.q3 || "N/A",
        q4: item.q4 || "N/A",
        plan_q1: item.plan_q1 || "",
        plan_q2: item.plan_q2 || "",
        plan_q3: item.plan_q3 || "",
        plan_q4: item.plan_q4 || "",
        // You can add any other relevant fields here
      });
    });

    return groups;
  }

  useEffect(() => {
    async function fetchAssignedKpis() {
      if (!sectorId) return;

      try {
        const res = await fetch(
          `/api/assign/assigned-kpi-with-goal-details/${sectorId}`
        );
        if (!res.ok) throw new Error("Failed to fetch assigned KPIs");

        const data = await res.json();

        const grouped = groupByGoalAndKra(data);

        setGroupedKpis(grouped);
      } catch (err) {
        console.error(err);
        setGroupedKpis({});
      }
    }

    fetchAssignedKpis();
  }, [sectorId]);

  return (
    <div>
      {Object.keys(groupedKpis).length === 0 && <p>No assigned KPIs found.</p>}
      {Object.entries(groupedKpis).map(([groupKey, rows]) => (
        <KPITable
          key={groupKey}
          groupKey={groupKey}
          rows={rows}
          openModal={openModal}
        />
      ))}
    </div>
  );
}

export default AssignedKpisTable;
