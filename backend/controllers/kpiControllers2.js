import KRA2 from "../models/kraModel2.js";
import Goal2 from "../models/goalModel2.js";
import KPI2 from "../models/kpiModel2.js";

// Create a new KPI
export const createKPI = async (req, res) => {
  try {
    const { kpi_name, kraId, goalId } = req.body;

    if (!kpi_name || !kraId || !goalId) {
      return res.status(400).json({ error: "kpi_name, kraId, and goalId are required" });
    }

    // Validate referenced KRA and Goal existence
    const [kraExists, goalExists] = await Promise.all([
      KRA2.findById(kraId),
      Goal2.findById(goalId),
    ]);

    if (!kraExists || !goalExists) {
      return res.status(404).json({ error: "Invalid kraId or goalId" });
    }

    const kpi = new KPI2({ kpi_name, kraId, goalId });
    await kpi.save();

    return res.status(201).json({ message: "KPI created successfully", data: kpi });
  } catch (err) {
    console.error("Error creating KPI:", err);
    return res.status(500).json({ error: "Failed to create KPI", details: err.message });
  }
};

// Get all KPIs with their KRA and Goal info
export const getAllKPIs = async (req, res) => {
  try {
    const kpis = await KPI2.find()
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
      kra: kpi.kraId
        ? {
            kra_id: kpi.kraId._id,
            kra_name: kpi.kraId.kra_name,
          }
        : null,
      goal: kpi.kraId && kpi.kraId.goalId
        ? {
            goal_id: kpi.kraId.goalId._id,
            goal_desc: kpi.kraId.goalId.goal_desc,
          }
        : null,
    }));

    return res.status(200).json({ success: true, data: structuredData });
  } catch (err) {
    console.error("Error fetching KPIs:", err);
    return res.status(500).json({ error: "Failed to fetch KPIs with related data", details: err.message });
  }
};

// Get structured data by Goal → KRA → KPI
export const getAllKPIData = async (req, res) => {
  try {
    const [goals, kras, kpis] = await Promise.all([
      Goal2.find({}, "_id goal_desc").lean(),
      KRA2.find({}, "_id kra_name goalId").lean(),
      KPI2.find({}, "_id kpi_name kraId").lean(),
    ]);

    const result = goals.map((goal) => {
      const goalKras = kras.filter((kra) => kra.goalId.toString() === goal._id.toString());

      const structuredKras = goalKras.map((kra) => {
        const kraKpis = kpis.filter((kpi) => kpi.kraId.toString() === kra._id.toString());

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

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching goal-KRA-KPI data:", err);
    return res.status(500).json({ error: "Failed to fetch goal-KRA-KPI data", details: err.message });
  }
};

// Get assigned KPIs with their related KRA and Goal info
export const getAssignedKPIs = async (req, res) => {
  try {
    const assignedKPIs = await KPI2.find()
      .populate({
        path: "kraId",
        select: "kra_name goalId",
        populate: {
          path: "goalId",
          select: "goal_desc",
        },
      })
      .select("kpi_name kraId");

    const formatted = assignedKPIs.map((kpi) => ({
      kpi_id: kpi._id,
      kpi_name: kpi.kpi_name,
      assigned_to_kra: kpi.kraId?.kra_name || null,
      assigned_to_goal: kpi.kraId?.goalId?.goal_desc || null,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching assigned KPIs:", error);
    return res.status(500).json({ error: "Failed to fetch assigned KPIs", details: error.message });
  }
};

export const editKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { kpi_name, kraId, goalId } = req.body;

    if (!kpi_name || !kraId || !goalId) {
      return res.status(400).json({ error: "kpi_name, kraId, and goalId are required" });
    }

    const [kraExists, goalExists] = await Promise.all([
      KRA2.findById(kraId),
      Goal2.findById(goalId),
    ]);

    if (!kraExists || !goalExists) {
      return res.status(404).json({ error: "Invalid kraId or goalId" });
    }

    const updatedKPI = await KPI2.findByIdAndUpdate(
      id,
      { kpi_name, kraId, goalId },
      { new: true }
    );

    if (!updatedKPI) {
      return res.status(404).json({ error: "KPI not found" });
    }

    return res.status(200).json({ message: "KPI updated successfully", data: updatedKPI });
  } catch (err) {
    res.status(500).json({ error: "Failed to update KPI", details: err.message });
  }
};

export const deleteKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedKPI = await KPI2.findByIdAndDelete(id);
    if (!deletedKPI) {
      return res.status(404).json({ error: "KPI not found" });
    }
    res.status(200).json({ message: "KPI deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete KPI", details: err.message });
  }
};