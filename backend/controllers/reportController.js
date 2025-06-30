import User from "../models/userModels.js";
import Plan from "../models/planModels.js";



export const generateUserReport = async (req, res) => {
  try {
    const userId = req.userId; 

    const user = await User.findById(userId)
      .select("-password")
      .populate("sector", "sector_name")
      .populate("subsector", "subsector_name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plans = await Plan.find({ userId })
      .populate("goalId", "goal_name")
      .populate("kraId", "kra_name")
      .populate("kpiId", "kpi_name");

    const report = {};

    plans.forEach((plan) => {
      const goalName = plan.goalId?.goal_name || "Unknown Goal";
      const kraName = plan.kraId?.kra_name || "Unknown KRA";
      const kpiName = plan.kpiId?.kpi_name || plan.kpi_name || "Unknown KPI";

      if (!report[goalName]) report[goalName] = {};
      if (!report[goalName][kraName]) report[goalName][kraName] = [];

      report[goalName][kraName].push({
        kpi: kpiName,
        target: plan.target,
        q1: plan.q1,
        q2: plan.q2,
        q3: plan.q3,
        q4: plan.q4,
        year: plan.year,
        validationStatus: {
          year: plan.validationStatusYear,
          q1: plan.validationStatusQ1,
          q2: plan.validationStatusQ2,
          q3: plan.validationStatusQ3,
          q4: plan.validationStatusQ4,
        },
        validationDescription: {
          year: plan.validationDescriptionYear,
          q1: plan.validationDescriptionQ1,
          q2: plan.validationDescriptionQ2,
          q3: plan.validationDescriptionQ3,
          q4: plan.validationDescriptionQ4,
        },
      });
    });

    res.status(200).json({
      userProfile: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        sector: user.sector?.sector_name || "N/A",
        subSector: user.subsector?.subsector_name || "N/A",
      },
      report,
    });
  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ message: "Server error while generating report" });
  }
};
