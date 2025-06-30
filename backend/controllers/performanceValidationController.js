import Performance from '../models/performanceModel.js';
import Notify from '../models/notifyModel.js';
import mongoose from 'mongoose';

// Fetch all performances with populated references
export const getAllPerformances = async (req, res) => {
  console.log("==== /api/performance-validation GET called ====");
  try {
    const { year, quarter = 'year', sectorId: querySectorId, subsectorId: querySubsectorId } = req.query;

    // Get role and user sector/subsector from headers (sent from frontend)
    const role = req.headers["x-user-role"] || "";
    const userSectorId = req.headers["x-sector-id"] || null;
    const userSubsectorId = req.headers["x-subsector-id"] || null;

    console.log("Incoming role:", role);
    console.log("Sector ID:", userSectorId);
    console.log("Subsector ID:", userSubsectorId);
    console.log("Query params:", req.query);

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    const filter = { year: String(year) };

    // Filter performances must have value for the quarter/year requested
    if (quarter !== "year") {
      filter[`${quarter}Performance.value`] = { $ne: null };
    } else {
      filter.performanceYear = { $ne: null };
    }

    // Role-based filtering logic

    if (role === 'CEO') {
      if (!userSubsectorId) {
        console.warn("CEO role but no subsectorId attached.");
      } else {
        filter.subsectorId = userSubsectorId;
      }
      // CEO sees all performances for their subsector, no validation filtering
    } else if (role === 'Chief CEO') {
      if (!userSectorId) {
        console.warn("Chief CEO role but no sectorId attached.");
      } else {
        filter.sectorId = userSectorId;
      }
      // Filter only CEO-approved performances
      const ceoValidationField = quarter === "year" ? "ceoValidationYear" : `ceoValidation${quarter.toUpperCase()}`;
      filter[ceoValidationField] = "Approved";
    } else if (role === 'Strategic Unit') {
      // Strategic Unit sees only Chief CEO approved performances
      const chiefCeoValidationField = quarter === "year" ? "chiefCeoValidationYear" : `chiefCeoValidation${quarter.toUpperCase()}`;
      filter[chiefCeoValidationField] = "Approved";
    } else if (role === 'Minister') {
      // Minister sees only Strategic Unit approved performances
      const strategicValidationField = quarter === "year" ? "strategicValidationYear" : `strategicValidation${quarter.toUpperCase()}`;
      filter[strategicValidationField] = "Approved";
    }

    // Additional optional filters from query params (UI)
    // Do not override sector/subsector filters set by role restrictions for CEO and Chief CEO
    if (querySectorId && !(role === 'CEO' || role === 'Chief CEO')) {
      filter.sectorId = querySectorId;
    }
    if (querySubsectorId && role !== 'CEO') {
      filter.subsectorId = querySubsectorId;
    }

    console.log("MongoDB filter object:", JSON.stringify(filter, null, 2));

    const performances = await Performance.find(filter)
      .populate('sectorId', 'name sector_name')
      .populate('subsectorId', 'name subsector_name')
      .populate('kpiId', 'kpi_name')
      .populate('kraId', 'kra_name')
      .populate('goalId', 'goal_desc')
      .exec();

    console.log(`Performances found: ${performances.length}`);
    if (performances.length > 0) {
      performances.forEach(p => {
        console.log(`KPI: ${p.kpiId?.kpi_name || "N/A"}, Year: ${p.year}, CEO Validation: ${p.ceoValidationYear}, Chief CEO Validation: ${p.chiefCeoValidationYear}, Strategic Validation: ${p.strategicValidationYear}`);
      });
    } else {
      console.log("No performances matched the filter.");
    }

    res.status(200).json(performances);

  } catch (error) {
    console.error('Error fetching performances:', error);
    res.status(500).json({ message: 'Failed to fetch performances' });
  }
};

// PATCH validation
// PATCH validation
export const validatePerformance = async (req, res) => {
  console.log("==== [PATCH] /api/performance-validation/validate/:id called ====");
  try {
    const { id } = req.params;
    const { type, status, description } = req.body;

    // Get role from headers or fallback to body
    const role = req.headers["x-user-role"] || req.body.role || "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid performance ID.' });
    }

    const allowedTypes = ['year', 'q1', 'q2', 'q3', 'q4'];
    const allowedStatuses = ['Approved', 'Rejected', 'Pending'];

    if (!allowedTypes.includes(type) || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid type or status.' });
    }

    // Determine which field prefix to update based on role
    let fieldPrefix = '';
    if (role === 'CEO') fieldPrefix = 'ceoValidation';
    else if (role === 'Chief CEO') fieldPrefix = 'chiefCeoValidation';
    else if (role === 'Strategic Unit') fieldPrefix = 'strategicValidation';
    else if (role === 'Minister') fieldPrefix = 'validationStatus';
    else return res.status(403).json({ message: 'Unauthorized role for validation.' });

    const statusField = type === 'year'
      ? `${fieldPrefix}Year`
      : `${fieldPrefix}${type.toUpperCase()}`;
    const descField = type === 'year'
      ? `${fieldPrefix}DescriptionYear`
      : `${fieldPrefix}Description${type.toUpperCase()}`;

    const update = {
      [statusField]: status,
      [descField]: description || '',
    };

    const updatedPerformance = await Performance.findByIdAndUpdate(id, update, { new: true })
      .populate('kpiId', 'kpi_name')
      .populate('userId', '_id'); // populate userId in case it's needed

    if (!updatedPerformance) {
      return res.status(404).json({ message: 'Performance not found.' });
    }

    console.log(`Performance ${id} updated for ${statusField} to ${status}`);

    
    // ✅ Notify the user
    try {
  await Notify.create({
    recipientId: updatedPerformance.userId,  // ✅ correct field
    title: `Performance Validation ${type.toUpperCase()}`,
    module: 'Performance Validation',
    message: `Your performance for KPI "${updatedPerformance.kpiId?.kpi_name || "N/A"}" in ${type.toUpperCase()} was ${status} by ${role.toUpperCase()}.`,
    referenceType: 'performance',  // ✅ valid enum: 'plan', 'performance', or 'measure'
    referenceId: updatedPerformance._id      // ✅ required reference
  });
  console.log("✅ Notification for performance validation sent.");
} catch (notifyErr) {
  console.error("❌ Failed to send notification:", notifyErr.message);
}


    return res.status(200).json(updatedPerformance);

  } catch (error) {
    console.error('Error validating performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


