// controllers/workerPlanController.js
import mongoose from 'mongoose';
import MeasureAssignment from '../models/measureAssignmentModel.js';
import User from '../models/userModels.js';

// 1) Existing endpoint for normal use — returns only user's own plans or by workerId if given
export const getWorkerPlans = async (req, res) => {
  try {
    const userId = req.query.workerId; // might be empty
    const { year, quarter, kpiId } = req.query;

    const filter = {};

    if (userId && userId !== "") {
      filter.workerId = new mongoose.Types.ObjectId(userId);
    }

    if (year) filter.year = year;
    if (quarter) filter.quarter = quarter;

    const assignments = await MeasureAssignment.find(filter)
      .populate({
        path: "measureId",
        populate: {
          path: "kpiId",
          model: "KPI2",
          select: "kpi_name",
        },
        select: "name kpiId",
      })
      .lean();

    const filtered = assignments.filter(
      (a) =>
        a.measureId &&
        a.measureId.kpiId &&
        (!kpiId || a.measureId.kpiId._id.toString() === kpiId)
    );

    const results = filtered.map((a) => ({
      kpiName: a.measureId.kpiId.kpi_name,
      kpiId: a.measureId.kpiId._id.toString(),
      measureName: a.measureId.name,
      workerId: a.workerId.toString(),
      measureId: a.measureId._id.toString(),
      target: a.target,
      year: a.year,
      quarter: a.quarter,
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("getWorkerPlans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2) New endpoint for CEO reports — CEO can fetch their subsector workers plans
export const getCeoWorkerPlans = async (req, res) => {
  try {
    const requestingUser = req.user;
    if (!requestingUser || requestingUser.role !== "CEO") {
      return res.status(403).json({ message: "Access denied" });
    }

    const ceoId = requestingUser._id.toString();
    const selectedWorkerId = req.query.workerId;
    const { year, quarter, kpiId } = req.query;

    // Get CEO subsector
    const ceo = await User.findById(ceoId).select("subsector").lean();
    if (!ceo || !ceo.subsector) {
      return res.status(400).json({ message: "CEO subsector not found" });
    }

    // Find workers in CEO subsector
    const workersInSubsector = await User.find({
      subsector: ceo.subsector,
      role: "Worker",
    }).select("_id").lean();

    const workerIds = workersInSubsector.map(w => w._id.toString());

    const filter = {};

    if (selectedWorkerId && selectedWorkerId !== "") {
      if (!workerIds.includes(selectedWorkerId)) {
        return res.status(403).json({ message: "Access denied: Worker not in your subsector" });
      }
      filter.workerId = new mongoose.Types.ObjectId(selectedWorkerId);
    } else {
      filter.workerId = { $in: workerIds };
    }

    if (year) filter.year = year;
    if (quarter) filter.quarter = quarter;

    const assignments = await MeasureAssignment.find(filter)
      .populate({
        path: "measureId",
        populate: {
          path: "kpiId",
          model: "KPI2",
          select: "kpi_name",
        },
        select: "name kpiId",
      })
      .lean();

    const filtered = assignments.filter(
      (a) =>
        a.measureId &&
        a.measureId.kpiId &&
        (!kpiId || a.measureId.kpiId._id.toString() === kpiId)
    );

    const results = filtered.map((a) => ({
      kpiName: a.measureId.kpiId.kpi_name,
      kpiId: a.measureId.kpiId._id.toString(),
      measureName: a.measureId.name,
      workerId: a.workerId.toString(),
      measureId: a.measureId._id.toString(),
      target: a.target,
      year: a.year,
      quarter: a.quarter,
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("getCeoWorkerPlans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

