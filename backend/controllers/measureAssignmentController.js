import mongoose from 'mongoose';
import MeasureAssignment from '../models/measureAssignmentModel.js';
import Measure from '../models/measureModel.js';
import Plan from '../models/planModels.js';
import KpiAssignment from '../models/kpiAssignmentModel.js';
import User from '../models/userModels.js';
import { sendNotification } from '../utils/notify.js';

// Helper: Calculate summed quarterly targets for KPI and year
async function calculateQuarterlyAndYearlyTargets(kpiId, year) {
  const measures = await Measure.find({ kpiId });
  const measureIds = measures.map(m => m._id);

  const aggregation = await MeasureAssignment.aggregate([
    { $match: { measureId: { $in: measureIds }, year } },
    {
      $group: {
        _id: "$quarter",
        totalTarget: { $sum: "$target" }
      }
    }
  ]);

  const quarterlyTargets = { q1: 0, q2: 0, q3: 0, q4: 0 };
  aggregation.forEach(({ _id, totalTarget }) => {
    const qKey = _id.toLowerCase();
    if (quarterlyTargets[qKey] !== undefined) {
      quarterlyTargets[qKey] = totalTarget;
    }
  });

  const yearlyTotal = Object.values(quarterlyTargets).reduce((a, b) => a + b, 0);

  return { quarterlyTargets, yearlyTotal };
}

// 🟢 Main Controller
export const assignMeasure = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(401).json({ message: "Authenticated user not found" });
    }
    const loggedInUserRole = loggedInUser.role;

    const { measureId, workerId, target, year, quarter } = req.body;

    if (!measureId || !workerId || !target || !year || !quarter) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let assignment = await MeasureAssignment.findOne({ measureId, workerId, year, quarter });
    if (assignment) {
      assignment.target = target;
      assignment = await assignment.save();
    } else {
      assignment = await MeasureAssignment.create({ measureId, workerId, target, year, quarter });
    }

    // ✅ Notify worker
    await notifyMeasureAssignment(assignment, loggedInUser);

    const measure = await Measure.findById(measureId).populate('kpiId');
    if (!measure || !measure.kpiId) {
      return res.status(404).json({ message: "KPI not found for measure." });
    }

    const kpiId = measure.kpiId._id;
    const { quarterlyTargets, yearlyTotal } = await calculateQuarterlyAndYearlyTargets(kpiId, year);

    const kpiAssign = await KpiAssignment.findOne({ kpiId });
    if (!kpiAssign) {
      return res.status(404).json({ message: "KPI Assignment not found." });
    }

    const sectorId = kpiAssign.sectorId;
    const subsectorId = kpiAssign.subsectorId;

    if (!sectorId || !subsectorId) {
      return res.status(400).json({ message: "Sector or Subsector not assigned for KPI." });
    }

    const filter = {
      kpiId,
      year,
      role: 'CEO',
      sectorId,
      subsectorId,
      userId: loggedInUserId,
    };

    const update = {
      kpiId,
      year,
      role: 'CEO',
      sectorId,
      subsectorId,
      target: yearlyTotal,
      q1: quarterlyTargets.q1,
      q2: quarterlyTargets.q2,
      q3: quarterlyTargets.q3,
      q4: quarterlyTargets.q4,
      kpi_name: measure.kpiId.kpi_name,
      kraId: measure.kpiId.kraId,
      goalId: measure.kpiId.goalId,
      userId: loggedInUserId,
      role: loggedInUserRole,
    };

    const ceoPlan = await Plan.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    return res.status(200).json({ assignment, ceoPlan });
  } catch (error) {
    console.error("assignMeasure error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// ✅ Notify Function
const notifyMeasureAssignment = async (assignment, assigner) => {
  try {
    const worker = await User.findById(assignment.workerId);
    if (!worker) return;

    await sendNotification({
      recipientId: worker._id,
      senderId: assigner._id,
      senderName: assigner.fullName,
      title: 'New KPI Measure Assigned',
      module: 'KPI Measure Management',
      message: `"${assigner.fullName}" assigned you a KPI measure for ${assignment.year} ${assignment.quarter}.`,
      referenceType: 'measure',
      referenceId: assignment._id,
    });
    console.log("✅ Measure assignment notification sent.");
  } catch (err) {
    console.error("❌ Failed to send measure assignment notification:", err.message);
  }
};
