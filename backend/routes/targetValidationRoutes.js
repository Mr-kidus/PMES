// routes/targetValidationRoutes.js
import express from 'express';
import {
  getAllPlans,
  validateTarget,
} from '../controllers/targetValidationController.js';

const targetRouter = express.Router();  // FIXED here: express.Router(), not express.targetRouter()

// Get all plans
targetRouter.get('/', getAllPlans);

// Validate target (approve/reject/pending)
targetRouter.patch('/validate/:id', validateTarget);


export default targetRouter;
