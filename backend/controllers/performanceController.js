import Performance from '../models/performanceModel.js';
import Plan from '../models/planModels.js';
import KPI from '../models/kpiModel2.js';
import Goal from '../models/goalModel2.js';
import KRA from '../models/kraModel2.js';
import mongoose from 'mongoose';

// Helper to sync goalId and kraId from KPI if missing
async function syncGoalAndKRA(performanceDoc) {
  if (!performanceDoc.goalId || !performanceDoc.kraId) {
    const kpi = await KPI.findById(performanceDoc.kpiId);
    if (kpi) {
      performanceDoc.goalId = kpi.goalId;
      performanceDoc.kraId = kpi.kraId;
      await performanceDoc.save();
    }
  }
}

// Create or update performance entry
export const createOrUpdatePerformance = async (req, res) => {
  console.log("Request body received:", req.body);
  try {
    const {
      userId,
      role,
      year,
      quarter, // optional
      kpi_name,
      performanceMeasure,
      description,
      sectorId,
      subsectorId,
    } = req.body;

    if (!userId || !role || !kpi_name || !year || performanceMeasure === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const kpi = await KPI.findOne({ kpi_name });
    if (!kpi) return res.status(404).json({ message: "KPI not found." });

    const goalId = kpi.goalId;
    const kraId = kpi.kraId;

    // Find the related plan
    const plan = await Plan.findOne({
      kpiId: kpi._id,
      year,
      role,
      sectorId,
      userId,
      ...(subsectorId && { subsectorId }),
    });

    if (!plan) {
      return res.status(404).json({ message: "No plan found." });
    }

    let target = 0;
    if (quarter && quarter.toLowerCase().startsWith("q")) {
      target = plan[quarter.toLowerCase()] || 0;
    } else {
      target = plan.target || 0;
    }

    const perfFilter = {
      userId,
      kpiId: kpi._id,
      year,
      sectorId,
      planId: plan._id,
      ...(subsectorId && { subsectorId }),
    };

    let existingPerformance = await Performance.findOne(perfFilter);
    const update = {
      userId,
      role,
      kpiId: kpi._id,
      kpi_name,
      year,
      target,
      sectorId,
      subsectorId,
      planId: plan._id,
      goalId,
      kraId,
    };

    if (quarter) {
      const q = quarter.toLowerCase();
      const perfField = `${q}Performance`;

      const q1 = existingPerformance?.q1Performance?.value || 0;
      const q2 = existingPerformance?.q2Performance?.value || 0;
      const q3 = existingPerformance?.q3Performance?.value || 0;

      if (q === 'q2' && performanceMeasure < q1)
        return res.status(400).json({ message: "Q2 performance must be ≥ Q1." });
      if (q === 'q3' && performanceMeasure < q2)
        return res.status(400).json({ message: "Q3 performance must be ≥ Q2." });
      if (q === 'q4' && performanceMeasure < q3)
        return res.status(400).json({ message: "Q4 performance must be ≥ Q3." });

      update[perfField] = {
        value: performanceMeasure,
        description: description || '',
      };

      const quarterFields = ['q4Performance', 'q3Performance', 'q2Performance', 'q1Performance'];
      let latest = 0;

      for (let field of quarterFields) {
        const val = field === perfField ? performanceMeasure : existingPerformance?.[field]?.value;
        if (val !== undefined && val !== null && val > 0) {
          latest = val;
          break;
        }
      }

      const lastYearPerf = await Performance.findOne({
        userId,
        kpiId: kpi._id,
        year: year - 1,
        sectorId,
        ...(subsectorId && { subsectorId }),
      });

      const lastYearPerformance = lastYearPerf?.performanceYear || 0;

      if (latest < lastYearPerformance) {
        return res.status(400).json({
          message: `Current year performance (${latest}) must be ≥ last year's (${lastYearPerformance}).`,
        });
      }

      update.performanceYear = latest;
      update.performanceDescription = description || '';
    } else {
      const lastYearPerf = await Performance.findOne({
        userId,
        kpiId: kpi._id,
        year: year - 1,
        sectorId,
        ...(subsectorId && { subsectorId }),
      });

      const lastYearPerformance = lastYearPerf?.performanceYear || 0;

      if (performanceMeasure < lastYearPerformance) {
        return res.status(400).json({
          message: `Current year performance (${performanceMeasure}) must be ≥ last year's (${lastYearPerformance}).`,
        });
      }

      update.performanceYear = performanceMeasure;
      update.performanceDescription = description || '';
    }

    const result = await Performance.findOneAndUpdate(
      perfFilter,
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync goalId/kraId if missing
    await syncGoalAndKRA(result);

    return res.status(201).json({
      message: "Performance saved successfully.",
      result,
    });

  } catch (error) {
    console.error("createOrUpdatePerformance error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get all performance entries with optional filters
export const getPerformances = async (req, res) => {
  try {
    const { userId, year, quarter, sectorId, subsectorId, kpiId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (year) filter.year = year;
    if (quarter) filter.quarter = quarter;
    if (sectorId) filter.sectorId = sectorId;
    if (subsectorId) filter.subsectorId = subsectorId;
    if (kpiId) filter.kpiId = kpiId;

    const performances = await Performance.find(filter)
      .populate('goalId', 'goal_desc')
      .populate('kraId', 'kra_name')
      .populate('kpiId', 'kpi_name')
      .sort({ year: 1, quarter: 1 });

    return res.status(200).json(performances);
  } catch (error) {
    console.error("getPerformances error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// NEW: Get performanceMeasure + description + plan target by userId, role, year, quarter, kpiName, sectorId, subsectorId
export const getPerformanceAndTarget = async (req, res) => {
  try {
    const {
      userId,
      role,
      year,
      quarter,
      kpiName,
      sectorId,
      subsectorId,
    } = req.query;

    if (!userId || !role || !year || !kpiName) {
      return res.status(400).json({ message: "Missing required query parameters." });
    }

    // Find KPI by name and always get goalId and kraId from it
    const kpi = await KPI.findOne({ kpi_name: kpiName });
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found." });
    }
    const goalId = kpi.goalId;
    const kraId = kpi.kraId;

    // Find Plan for target
    const planFilter = {
      kpiId: kpi._id,
      year,
      role,
      sectorId,
      userId,
      ...(subsectorId && { subsectorId }),
      ...(goalId && { goalId }),
      ...(kraId && { kraId }),
    };

    const plan = await Plan.findOne(planFilter)
      .populate('goalId', 'goal_desc')
      .populate('kraId', 'kra_name');

    // Extract target for the quarter or yearly target if quarter missing
    let target = 0;
    if (plan) {
      if (quarter && quarter.toLowerCase().startsWith("q")) {
        target = plan[quarter.toLowerCase()] || 0;
      } else {
        target = plan.target || 0;
      }
    }

    // Find existing performance record and populate goalId/kraId
    const perfFilter = {
      userId,
      kpiId: kpi._id,
      year,
      ...(sectorId && { sectorId }),
      ...(subsectorId && { subsectorId }),
      ...(goalId && { goalId }),
      ...(kraId && { kraId }),
    };

    let performance = await Performance.findOne(perfFilter)
      .populate('goalId', 'goal_desc')
      .populate('kraId', 'kra_name');

    let goalName = "";
    let kraName = "";
    let goalIdResult = "";
    let kraIdResult = "";

    if (performance) {
      goalName = performance.goalId?.goal_desc || "";
      kraName = performance.kraId?.kra_name || "";
      goalIdResult = performance.goalId?._id?.toString() || "";
      kraIdResult = performance.kraId?._id?.toString() || "";
    } else if (plan) {
      goalName = plan.goalId?.goal_desc || "";
      kraName = plan.kraId?.kra_name || "";
      goalIdResult = plan.goalId?._id?.toString() || "";
      kraIdResult = plan.kraId?._id?.toString() || "";
    } else {
      // fallback to kpi if neither performance nor plan exists
      if (goalId) {
        const goalDoc = await Goal.findById(goalId);
        goalName = goalDoc?.goal_desc || "";
        goalIdResult = goalDoc?._id?.toString() || "";
      }
      if (kraId) {
        const kraDoc = await KRA.findById(kraId);
        kraName = kraDoc?.kra_name || "";
        kraIdResult = kraDoc?._id?.toString() || "";
      }
    }

    // Get validation status from performance table only
    let validationStatus = "Pending";
    if (performance) {
      if (quarter && quarter.toLowerCase().startsWith("q")) {
        const perfStatusKey = `validationStatus${quarter.charAt(0).toUpperCase()}${quarter.slice(1)}`;
        validationStatus = performance[perfStatusKey] || "Pending";
      } else {
        validationStatus = performance.validationStatusYear || "Pending";
      }
    }

    // --- FIXED: Always return the correct performance measure and description ---
    let performanceMeasure = "";
    let description = "";

    if (performance) {
      if (quarter && quarter.toLowerCase().startsWith("q")) {
        const perfField = `${quarter.toLowerCase()}Performance`;
        performanceMeasure = performance[perfField]?.value ?? "";
        description = performance[perfField]?.description ?? "";
      } else {
        performanceMeasure = performance.performanceYear ?? "";
        description = performance.performanceDescription ?? "";
      }
    }

    return res.status(200).json({
      target,
      performanceMeasure,
      description,
      validationStatus,
      goal: goalName,
      kra: kraName,
      goalId: goalIdResult,
      kraId: kraIdResult,
    });
  } catch (error) {
    console.error("getPerformanceAndTarget error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get single performance entry by ID
export const getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid performance ID." });
    }

    const performance = await Performance.findById(id)
      .populate('sectorId', 'name')
      .populate('subsectorId', 'name')
      .populate('kpiId', 'kpi_name')
      .populate('goalId', 'goal_desc')
      .populate('kraId', 'kra_name');

    if (!performance) return res.status(404).json({ message: "Performance not found." });

    return res.status(200).json(performance);
  } catch (error) {
    console.error("getPerformanceById error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Update performance entry by ID
export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid performance ID." });
    }

    delete updateData.userId;
    delete updateData.role;

    const updated = await Performance.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Performance not found." });

    await syncGoalAndKRA(updated);

    return res.status(200).json(updated);
  } catch (error) {
    console.error("updatePerformance error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// Delete performance entry by ID
export const deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid performance ID." });
    }

    const deleted = await Performance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Performance not found." });

    return res.status(200).json({ message: "Performance deleted successfully." });
  } catch (error) {
    console.error("deletePerformance error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// Example: backend/controllers/performanceController.js

export const getPerformanceMeasure = async (req, res) => {
  const {
    kpiName,
    kraId,
    role,
    sectorId,
    subsectorId,
    userId,
    year,
    quarter,
  } = req.query;

  const filter = { kpiName, kraId, role, sectorId, userId, year };
  if (subsectorId) filter.subsectorId = subsectorId;

  const performance = await Performance.findOne(filter);
  if (!performance) return res.json({});

  let performanceMeasure = "";
  let description = "";
  let validationStatus = performance.validationStatusYear;
  let goal = performance.goalId;
  let kra = performance.kraId;

  if (quarter && quarter.toLowerCase().startsWith("q")) {
    const qKey = quarter.toLowerCase();
    performanceMeasure = performance[`${qKey}Performance`]?.value ?? "";
    description = performance[`${qKey}Performance`]?.description ?? "";
    validationStatus = performance[`validationStatus${qKey.toUpperCase()}`];
  } else {
    performanceMeasure = performance.performanceYear ?? "";
    description = performance.performanceDescription ?? "";
    validationStatus = performance.validationStatusYear;
  }

  return res.status(200).json({
    performanceMeasure,
    description,
    validationStatus,
    goalId: goal,
    kraId: kra,
  });
};

export const upsertPerformance = async (req, res) => {
  try {
    const {
      planId,
      performanceMeasure,
      quarter,
      year,
      description,
      userId,
      role,
      sectorId,
      subsectorId,
      kraId,
      kpi_name,
      goal,
    } = req.body;

    let perf = await Performance.findOne({ planId });
    if (!perf) {
      perf = new Performance({ planId, userId, role, sectorId, subsectorId, kraId, kpiName: kpi_name, year, goalId: goal });
    }

    perf.performanceYear = quarter ? perf.performanceYear : performanceMeasure;
    if (quarter) {
      perf[`${quarter.toLowerCase()}Performance`].value = performanceMeasure;
      perf[`${quarter.toLowerCase()}Performance`].description = description;
    } else {
      perf.performanceDescription = description;
    }

    await perf.save();

    const plan = await Plan.findById(planId);
    if (plan) {
      if (quarter) plan[quarter.toLowerCase()] = performanceMeasure;
      else plan.target = plan.target;
      await plan.save();
    }

    res.status(200).json({ message: "Performance saved", perf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

import { sendNotification } from '../utils/notify.js';


const handleValidationChange = async (planOrPerf, updaterUser, type = 'plan') => {
  const ownerUser = await User.findById(planOrPerf.userId);
  if (!ownerUser) return;

  await sendNotification({
    recipientId: ownerUser._id,
    senderId: updaterUser._id,
    senderName: updaterUser.fullName || updaterUser.username,
    title: 'Validation Updated',
    module: type === 'plan' ? 'Plan Management' : 'Performance Management',
    message: `"${updaterUser.fullName}" updated the validation for your ${type}.`,
    referenceType: type,
    referenceId: planOrPerf._id,
  });
};
