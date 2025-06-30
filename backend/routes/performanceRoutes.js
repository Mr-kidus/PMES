import express from 'express';
import {
  createOrUpdatePerformance,
  getPerformances,
  getPerformanceAndTarget,
  upsertPerformance,
} from '../controllers/performanceController.js';

const performanceRouter = express.Router();


// POST: Create or update performance (quarterly or yearly based on 'quarter' in body)
performanceRouter.post('/performance', createOrUpdatePerformance);

// GET: Retrieve all performance records filtered by query params
performanceRouter.get('/performance', getPerformances);

// GET: Retrieve both performanceMeasure + description + plan target (for modal/viewing)
performanceRouter.get('/performance/measure', getPerformanceAndTarget);

// POST: Upsert performance record (create or update)
performanceRouter.post('/performance/upsert', upsertPerformance);

export default performanceRouter;
