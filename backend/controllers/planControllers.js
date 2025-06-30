import Plan from '../models/planModels.js';
import mongoose from 'mongoose';
import KPI from '../models/kpiModel2.js';
import KpiAssignment from '../models/kpiAssignmentModel.js';


// Create or update a plan (yearly or quarterly target)
export const createOrUpdatePlan = async (req, res) => {
  console.log("Received createOrUpdatePlan request body:", req.body);
  try {
    const {
      userId,
      role,
      kpiName,       // Expect camelCase from client
      year,
      target,
      description,
      quarter,
      kraId,
      goalId,
      sectorId: inputSectorId,
      subsectorId: inputSubsectorId,
    } = req.body;

    // Map camelCase kpiName to snake_case kpi_name internally
    const kpi_name = kpiName;

    // Basic validations
    if (!userId || !role || !kpi_name || !year) {
      return res.status(400).json({ message: "Missing required fields: userId, role, kpi_name, or year." });
    }

    // Find KPI document
    const kpiDoc = await KPI.findOne({ kpi_name });
    if (!kpiDoc) {
      return res.status(404).json({ message: `KPI not found for name: ${kpi_name}` });
    }

    const kpiId = kpiDoc._id;
    const kpiKraId = kpiDoc.kraId;
    const kpiGoalId = kpiDoc.goalId;

    // Use provided kraId and goalId or fallback from KPI doc
    const finalKraId = kraId || kpiKraId;
    const finalGoalId = goalId || kpiGoalId;

    if (!finalKraId || !finalGoalId) {
      return res.status(400).json({ message: "KPI must have associated KRA and Goal." });
    }

    // Determine sectorId and subsectorId, try fallback from KpiAssignment if missing
    let sectorId = inputSectorId;
    let subsectorId = inputSubsectorId;

    if (!sectorId || !subsectorId) {
      const assignment = await KpiAssignment.findOne({ kpiId });
      if (assignment) {
        if (!sectorId && assignment.sectorId) sectorId = assignment.sectorId;
        if (!subsectorId && assignment.subsectorId) subsectorId = assignment.subsectorId;
      }
    }

    if (!sectorId) {
      return res.status(400).json({ message: "Sector ID is required and could not be auto-filled." });
    }

    // Prepare filters
    // Plan created by this user and role
    const userPlanFilter = { kpiId, year, sectorId, subsectorId, userId, role };
    let existingUserPlan = await Plan.findOne(userPlanFilter);

    // Any plan created by CEO or other roles (excluding worker)
    const otherPlanFilter = { kpiId, year, sectorId, subsectorId, role: { $ne: 'worker' } };
    const existingOtherPlan = await Plan.findOne(otherPlanFilter);

    // Helper function to validate and convert target to number
    const parseTarget = (val) => {
      const num = Number(val);
      if (isNaN(num)) {
        return null;
      }
      return num;
    };

    // Handle quarterly target update/create
    if (quarter && target !== undefined) {
      const qKey = quarter.toLowerCase(); // e.g. 'q1'
      if (!['q1', 'q2', 'q3', 'q4'].includes(qKey)) {
        return res.status(400).json({ message: "Invalid quarter value. Must be one of q1, q2, q3, q4." });
      }

      const quarterTargetNum = parseTarget(target);
      if (quarterTargetNum === null) {
        return res.status(400).json({ message: "Quarter target must be a valid number." });
      }

      if (role === 'worker') {
        // Workers must not update CEO plans

        if (existingUserPlan) {
          // Update worker's own plan
          existingUserPlan[qKey] = quarterTargetNum;
          if (description !== undefined) existingUserPlan.description = description;
          const updatedPlan = await existingUserPlan.save();
          return res.status(200).json(updatedPlan);
        } else {
          // Create new plan for worker
          const newPlan = new Plan({
            userId,
            role,
            sectorId,
            subsectorId,
            kpiId,
            kpi_name,
            kraId: finalKraId,
            goalId: finalGoalId,
            year,
            target: 0, // yearly target default 0 when only quarter provided
            [qKey]: quarterTargetNum,
            description: description || '',
          });
          const savedPlan = await newPlan.save();
          return res.status(201).json({ planId: savedPlan._id, ...savedPlan._doc });
        }
      } else {
        // CEO or other roles - update or create plan normally

        if (existingOtherPlan) {
          existingOtherPlan[qKey] = quarterTargetNum;
          if (description !== undefined) existingOtherPlan.description = description;
          const updatedPlan = await existingOtherPlan.save();
          return res.status(200).json(updatedPlan);
        } else {
          const newPlan = new Plan({
            userId,
            role,
            sectorId,
            subsectorId,
            kpiId,
            kpi_name,
            kraId: finalKraId,
            goalId: finalGoalId,
            year,
            target: 0,
            [qKey]: quarterTargetNum,
            description: description || '',
          });
          const savedPlan = await newPlan.save();
          return res.status(201).json({ planId: savedPlan._id, ...savedPlan._doc });
        }
      }
    }

    // Handle yearly target update/create (when no quarter provided)
    if (target === undefined) {
      return res.status(400).json({ message: "Target is required when quarter info is not provided." });
    }

    const targetNum = parseTarget(target);
    if (targetNum === null) {
      return res.status(400).json({ message: "Target must be a valid number." });
    }

    if (role === 'worker') {
      // Workers cannot update CEO plans

      if (existingUserPlan) {
        // update worker's own plan preserving quarterly targets
        existingUserPlan.target = targetNum;
        if (description !== undefined) existingUserPlan.description = description;
        const updatedPlan = await existingUserPlan.save();
        return res.status(200).json(updatedPlan);
      } else {
        // create new plan for worker
        const newPlan = new Plan({
          userId,
          role,
          sectorId,
          subsectorId,
          kpiId,
          kpi_name,
          kraId: finalKraId,
          goalId: finalGoalId,
          year,
          target: targetNum,
          description: description || '',
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
        });
        const savedPlan = await newPlan.save();
        return res.status(201).json({ planId: savedPlan._id, ...savedPlan._doc });
      }
    } else {
      // CEO or other roles update or create normally

      if (existingOtherPlan) {
        // preserve quarterly targets
        existingOtherPlan.target = targetNum;
        if (description !== undefined) existingOtherPlan.description = description;
        const updatedPlan = await existingOtherPlan.save();
        return res.status(200).json(updatedPlan);
      } else {
        const newPlan = new Plan({
          userId,
          role,
          sectorId,
          subsectorId,
          kpiId,
          kpi_name,
          kraId: finalKraId,
          goalId: finalGoalId,
          year,
          target: targetNum,
          description: description || '',
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
        });
        const savedPlan = await newPlan.save();
        return res.status(201).json({ planId: savedPlan._id, ...savedPlan._doc });
      }
    }
  } catch (error) {
    console.error("createOrUpdatePlan error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// Other controllers unchanged, full versions below

// Get all plans (with optional filters)
export const getPlans = async (req, res) => {
  try {
    const { userId, year, sectorId, subsectorId, kpiId } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (year) filter.year = year;
    if (sectorId) filter.sectorId = sectorId;
    if (subsectorId) filter.subsectorId = subsectorId;
    if (kpiId) filter.kpiId = kpiId;

    const plans = await Plan.find(filter)
      .populate('sectorId', 'name')
      .populate('subsectorId', 'name')
      .populate('kpiId', 'kpi_name')
      .populate('kraId', 'kra_name')
      .populate('goalId', 'goal_desc')
      .sort({ year: 1 });

    return res.status(200).json(plans);
  } catch (error) {
    console.error("getPlans error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get a single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plan ID." });
    }

    const plan = await Plan.findById(id)
      .populate('sectorId', 'name')
      .populate('subsectorId', 'name')
      .populate('kpiId', 'kpi_name')
      .populate('kraId', 'kra_name')
      .populate('goalId', 'goal_desc');

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.status(200).json(plan);
  } catch (error) {
    console.error("getPlanById error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Update a plan by ID
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plan ID." });
    }

    // Remove userId and role from update to protect ownership
    delete updateData.userId;
    delete updateData.role;

    // Validate target number if present
    if (updateData.target !== undefined) {
      const targetNum = Number(updateData.target);
      if (isNaN(targetNum)) {
        return res.status(400).json({ message: "Target must be a valid number." });
      }
      updateData.target = targetNum;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.status(200).json(updatedPlan);
  } catch (error) {
    console.error("updatePlan error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// Delete a plan by ID
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid plan ID." });
    }

    const deletedPlan = await Plan.findByIdAndDelete(id);
    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error) {
    console.error("deletePlan error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get plan target by KPI name, KRA, role, sector, user, year, optional quarter
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getPlanTarget = async (req, res) => {
  try {
    const kpi_name = req.query.kpi_name || req.query.kpiName;
    const { kraId, role, sectorId, subsectorId, userId, year, quarter } = req.query;

    // Validate required params
    if (!kpi_name || !kraId || !role || !sectorId || !userId || !year) {
      return res.status(400).json({ message: "Missing required query parameters." });
    }

    // Validate ObjectId format for IDs (except role and year)
    if (![kraId, sectorId, subsectorId, userId].every(id => !id || isValidObjectId(id))) {
      return res.status(400).json({ message: "One or more provided IDs are invalid." });
    }

    const kpiDoc = await KPI.findOne({ kpi_name });
    if (!kpiDoc) {
      return res.status(404).json({ message: `KPI not found for name: ${kpi_name}` });
    }

    const filter = {
      kpiId: kpiDoc._id,
      kraId,
      role,
      sectorId,
      userId,
      year,
    };
    if (subsectorId) filter.subsectorId = subsectorId;

    const plan = await Plan.findOne(filter);
    if (!plan) {
      return res.status(404).json({ message: "No plan found for the specified criteria." });
    }

    if (quarter) {
      const qKey = quarter.toLowerCase();
      const quarterTarget = plan[qKey];
      const validationStatusKey =
        "validationStatus" + qKey.charAt(0).toUpperCase() + qKey.slice(1);
      return res.status(200).json({
        planId: plan._id,
        target: quarterTarget !== undefined ? quarterTarget : "",
        description: plan[`${qKey}Description`] || "",
        year: plan.year,
        validationStatus: plan[validationStatusKey] || "Pending",
      });
    }

    return res.status(200).json({
      planId: plan._id,
      target: plan.target ?? "",
      description: plan.validationDescriptionYear || "",
      validationStatus: plan.validationStatusYear || "Pending",
      year: plan.year,
    });
  } catch (error) {
    console.error("getPlanTarget error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
