export function transformAssignedKpisToNested(assignedKpis) {
  // If assignedKpis is NOT an array, check if it's nested object by goalId
  if (!Array.isArray(assignedKpis)) {
   

    // Check if it's nested by goalId with 'goal_desc' and 'kras'
    if (Object.values(assignedKpis).every(goal =>
      goal.goal_desc !== undefined && goal.kras !== undefined
    )) {
      // Transform nested object keyed by goalId
      const goals = [];

      for (const [goalId, goalData] of Object.entries(assignedKpis)) {
        const { goal_desc, kras } = goalData;

        const krasArray = [];

        for (const [kraId, kraData] of Object.entries(kras || {})) {
          const { kra_name, kpis } = kraData;

          const kpisArray = Object.entries(kpis || {}).map(([kpiId, kpiData]) => ({
            kpi_id: kpiId,
            kpi_name: kpiData.kpi_name,
          }));

          krasArray.push({
            kra_id: kraId,
            kra_name,
            kpis: kpisArray,
          });
        }

        goals.push({
          goal_id: goalId,
          goal_desc,
          kras: krasArray,
        });
      }

      return goals;
    } else {
      // If it's some other object, try converting to array for old logic
      assignedKpis = Object.values(assignedKpis);
    }
  }

  // Now assignedKpis is an array, apply old logic
  const goalsMap = new Map();

  assignedKpis.forEach((item, index) => {
    if (
      !item.kraId ||
      !item.kraId.goalId ||
      !item.kpiId ||
      !item.kraId.goalId._id ||
      !item.kraId.goalId.goal_desc
    ) {
      console.warn(`Skipping item ${index} due to missing kraId or goalId or kpiId`);
      return;
    }

    const goalId = item.kraId.goalId._id.toString();
    const goalDesc = item.kraId.goalId.goal_desc;

    if (!goalsMap.has(goalId)) {
      goalsMap.set(goalId, {
        goal_id: goalId,
        goal_desc: goalDesc,
        kras: new Map(),
      });
    }

    const goal = goalsMap.get(goalId);

    const kraId = item.kraId._id.toString();
    const kraName = item.kraId.kra_name;

    if (!goal.kras.has(kraId)) {
      goal.kras.set(kraId, {
        kra_id: kraId,
        kra_name: kraName,
        kpis: [],
      });
    }

    const kra = goal.kras.get(kraId);

    kra.kpis.push({
      kpi_id: item.kpiId._id.toString(),
      kpi_name: item.kpiId.kpi_name,
    });
  });

  return Array.from(goalsMap.values()).map((goal) => ({
    ...goal,
    kras: Array.from(goal.kras.values()),
  }));
}
