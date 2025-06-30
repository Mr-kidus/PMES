import KPI from "../models/kpiModel.js";
import KRA from "../models/kraModel.js";
import Goal from "../models/goalModel.js";

// ✅ Create KPI
export const createKPI = async (req, res) => {
  try {
    const { kpi_name } = req.body;

    if (!kpi_name) {
      return res.status(400).json({ error: "kpi_name is required" });
    }

    const kra = await KRA.findOne();

    if (!kra || !kra.goalId) {
      return res
        .status(404)
        .json({ error: "No valid KRA or Goal found in the database" });
    }

    const kpi = new KPI({
      kpi_name,
      kraId: kra._id,
      goalId: kra.goalId,
    });

    await kpi.save();

    res.status(201).json({ message: "KPI created successfully", data: kpi });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create KPI", details: err.message });
  }
};

// ✅ Get all KPIs with populated kra and goal
export const getAllKPIs = async (req, res) => {
  try {
    const kpis = await KPI.find()
      .populate({
        path: "kraId",
        select: "kra_name goalId",
        populate: {
          path: "goalId",
          select: "goal_desc",
        },
      })
      .select("kpi_name kraId");

    const structuredData = kpis.map((kpi) => ({
      kpi_id: kpi._id,
      kpi_name: kpi.kpi_name,
      kra: {
        kra_id: kpi.kraId?._id,
        kra_name: kpi.kraId?.kra_name,
      },
      goal: {
        goal_id: kpi.kraId?.goalId?._id,
        goal_desc: kpi.kraId?.goalId?.goal_desc,
      },
    }));

    res.status(200).json({ success: true, data: structuredData });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch KPIs with related data",
      details: err.message,
    });
  }
};

// ✅ Get all data in nested structure: Goal → KRA → KPIs
export const getAllKPIData = async (req, res) => {
  try {
    const goals = await Goal.find({}, "_id goal_desc");
    const kras = await KRA.find({}, "_id kra_name goalId");
    const kpis = await KPI.find({}, "_id kpi_name kraId");

    const result = goals.map((goal) => {
      const goalKras = kras.filter(
        (kra) => kra.goalId?.toString() === goal._id.toString()
      );

      const structuredKras = goalKras.map((kra) => {
        const kraKpis = kpis.filter(
          (kpi) => kpi.kraId?.toString() === kra._id.toString()
        );

        return {
          _id: kra._id,
          kra_name: kra.kra_name,
          kpis: kraKpis.map((kpi) => ({
            _id: kpi._id,
            kpi_name: kpi.kpi_name,
          })),
        };
      });

      return {
        _id: goal._id,
        goal_desc: goal.goal_desc,
        kras: structuredKras,
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Failed to fetch goal-KRA-KPI data",
      details: err.message,
    });
  }
};
