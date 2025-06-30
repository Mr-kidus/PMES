import Plan from '../models/planModels.js';
import Notify from '../models/notifyModel.js';
import mongoose from 'mongoose';

// Validation fields by role, adjusted to your requested checks
const roleValidationFields = {
  ceo: {
    statusYear: 'ceoValidationYear',
    statusQ1: 'ceoValidationQ1',
    statusQ2: 'ceoValidationQ2',
    statusQ3: 'ceoValidationQ3',
    statusQ4: 'ceoValidationQ4',
    descYear: 'ceoValidationDescriptionYear',
    descQ1: 'ceoValidationDescriptionQ1',
    descQ2: 'ceoValidationDescriptionQ2',
    descQ3: 'ceoValidationDescriptionQ3',
    descQ4: 'ceoValidationDescriptionQ4',
  },
  'chief ceo': {
    // Chief CEO checks CEO validation fields
    statusYear: 'ceoValidationYear',
    statusQ1: 'ceoValidationQ1',
    statusQ2: 'ceoValidationQ2',
    statusQ3: 'ceoValidationQ3',
    statusQ4: 'ceoValidationQ4',
    descYear: 'ceoValidationDescriptionYear',
    descQ1: 'ceoValidationDescriptionQ1',
    descQ2: 'ceoValidationDescriptionQ2',
    descQ3: 'ceoValidationDescriptionQ3',
    descQ4: 'ceoValidationDescriptionQ4',
  },
  'strategic unit': {
    // Strategic Unit checks Chief CEO validation fields
    statusYear: 'chiefCeoValidationYear',
    statusQ1: 'chiefCeoValidationQ1',
    statusQ2: 'chiefCeoValidationQ2',
    statusQ3: 'chiefCeoValidationQ3',
    statusQ4: 'chiefCeoValidationQ4',
    descYear: 'chiefCeoValidationDescriptionYear',
    descQ1: 'chiefCeoValidationDescriptionQ1',
    descQ2: 'chiefCeoValidationDescriptionQ2',
    descQ3: 'chiefCeoValidationDescriptionQ3',
    descQ4: 'chiefCeoValidationDescriptionQ4',
  },
  minister: {
    // Minister checks Strategic Unit validation fields
    statusYear: 'strategicValidationYear',
    statusQ1: 'strategicValidationQ1',
    statusQ2: 'strategicValidationQ2',
    statusQ3: 'strategicValidationQ3',
    statusQ4: 'strategicValidationQ4',
    descYear: 'strategicValidationDescriptionYear',
    descQ1: 'strategicValidationDescriptionQ1',
    descQ2: 'strategicValidationDescriptionQ2',
    descQ3: 'strategicValidationDescriptionQ3',
    descQ4: 'strategicValidationDescriptionQ4',
  },
};


export const getAllPlans = async (req, res) => {
  console.log("==== /api/target-validation GET called ====");
  try {
    const {
      year,
      quarter = 'year',
      sector: querySectorId,
      subsector: querySubsectorId,
      statusFilter, // optional explicit status filter (Approved, Pending, Rejected)
    } = req.query;

    // Role and user's sector/subsector from headers sent by frontend
    const role = (req.headers["x-user-role"] || "").toLowerCase();
    const userSectorId = req.headers["x-sector-id"] || null;
    const userSubsectorId = req.headers["x-subsector-id"] || null;

    console.log("Incoming role:", role);
    console.log("User sector ID:", userSectorId);
    console.log("User subsector ID:", userSubsectorId);
    console.log("Query params:", req.query);

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    // Base filter
    const filter = { year: Number(year) };

    // Role-based validation field determination and filtering logic
    let validationField = null;

    if (role === 'ceo') {
      if (!userSubsectorId) {
        console.warn("CEO role but no subsectorId attached.");
      } else {
        filter.subsectorId = userSubsectorId;
      }
      // CEO does not filter by validation status
      console.log("[Backend] CEO role: no validation status filter");
    } else if (role === 'chief ceo') {
      if (!userSectorId) {
        console.warn("Chief CEO role but no sectorId attached.");
      } else {
        filter.sectorId = userSectorId;
      }
      // Chief CEO filters on CEO validation fields
      validationField = quarter === "year" ? "ceoValidationYear" : `ceoValidation${quarter.toUpperCase()}`;
    } else if (role === 'strategic unit') {
      // Strategic Unit filters on Chief CEO validation fields
      validationField = quarter === "year" ? "chiefCeoValidationYear" : `chiefCeoValidation${quarter.toUpperCase()}`;
    } else if (role === 'minister') {
      // Minister filters on Strategic Unit validation fields
      validationField = quarter === "year" ? "strategicValidationYear" : `strategicValidation${quarter.toUpperCase()}`;
    }

    // Apply validation filter if applicable
    if (validationField) {
      if (statusFilter && ['Approved', 'Pending', 'Rejected'].includes(statusFilter)) {
        filter[validationField] = statusFilter;
        console.log(`[Backend] Filtering on ${validationField} = "${statusFilter}" (explicit statusFilter)`);
      } else {
        // Default: only Approved
        filter[validationField] = "Approved";
        console.log(`[Backend] Filtering on ${validationField} = "Approved" (default)`);
      }
    }

    // Additional filtering by sector and subsector if role allows
    if (querySectorId && !(role === 'ceo' || role === 'chief ceo')) {
      filter.sectorId = querySectorId;
    }
    if (querySubsectorId && role !== 'ceo') {
      filter.subsectorId = querySubsectorId;
    }

    console.log("MongoDB filter object:", JSON.stringify(filter, null, 2));

    const plans = await Plan.find(filter)
      .populate('sectorId', 'sector_name')
      .populate('subsectorId', 'subsector_name')
      .populate('kpiId', 'kpi_name')
      .populate('kraId', 'kra_name')
      .populate('goalId', 'goal_desc')
      .exec();

    console.log(`Plans found: ${plans.length}`);

    if (plans.length > 0) {
      plans.forEach(plan => {
        console.log(`KPI: ${plan.kpiId?.kpi_name || "N/A"}, Year: ${plan.year}, CEO Validation: ${plan.ceoValidationYear}, Chief CEO Validation: ${plan.chiefCeoValidationYear}, Strategic Validation: ${plan.strategicValidationYear}`);
      });
    } else {
      console.log("No plans matched the filter.");
    }

    res.status(200).json(plans);

  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};


// PATCH endpoint to update validation status and description

export const validateTarget = async (req, res) => {
  try {
    const { id } = req.params;
    let { type, status, description = '', role } = req.body;

    console.log(`[Backend] PATCH /api/target-validation/validate/${id} called with`, req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan ID.' });
    }

    type = type?.toLowerCase();
    role = role?.toLowerCase();

    const allowedTypes = ['year', 'q1', 'q2', 'q3', 'q4'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be one of year, q1, q2, q3, q4.' });
    }

    const allowedStatuses = ['Approved', 'Rejected', 'Pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved, Rejected, or Pending.' });
    }

    if (!role || !roleValidationFields[role]) {
      return res.status(400).json({ message: 'Role is required and must be valid for validation.' });
    }

    const fields = roleValidationFields[role];
    if (!fields) {
      return res.status(400).json({ message: `No validation fields configured for role: ${role}` });
    }

    const statusField = type === 'year' ? fields.statusYear : fields[`status${type.toUpperCase()}`];
    const descField = type === 'year' ? fields.descYear : fields[`desc${type.toUpperCase()}`];

    if (!statusField || !descField) {
      return res.status(400).json({ message: 'Validation fields not found for the given type.' });
    }

    const update = {
      [statusField]: status,
      [descField]: description,
    };

    const updatedPlan = await Plan.findByIdAndUpdate(id, update, { new: true })
      .populate('sectorId', 'sector_name')
      .populate('subsectorId', 'subsector_name')
      .populate('kpiId', 'kpi_name')
      .populate('kraId', 'kra_name')
      .populate('goalId', 'goal_desc')
      .populate('userId', '_id name email'); // Populate userId for notification

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    console.log(`[Backend] Updated plan ${id}: Set ${statusField} = ${status}`);

    // Notify the user
    try {
      await Notify.create({
  recipientId: updatedPlan.userId._id,
  referenceId: updatedPlan._id,
  referenceType: 'plan',  // lowercase as per enum
  title: `Plan Validation ${type.toUpperCase()}`,
  module: 'Plan Validation',
  message: `Your plan for KPI "${updatedPlan.kpiId?.kpi_name || "N/A"}" in ${type.toUpperCase()} was ${status} by ${role.toUpperCase()}.`,
});

      console.log("✅ Notification sent.");
    } catch (notifyErr) {
      console.error("❌ Failed to send notification:", notifyErr.message);
    }

    return res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('[Backend] Error validating target:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

