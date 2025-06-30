import express from 'express';
import {
  getAllPerformances,
  validatePerformance,
} from '../controllers/performanceValidationController.js';

const performanceValidationRouter = express.Router();

performanceValidationRouter.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  console.log("Query params:", req.query);
  next();
});

// Get all plans
performanceValidationRouter.get('/', getAllPerformances);

// Validate performance (approve/reject/pending)
performanceValidationRouter.patch('/validate/:id', validatePerformance);

export default performanceValidationRouter;
