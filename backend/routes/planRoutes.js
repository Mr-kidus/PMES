import express from 'express';
import {
  createOrUpdatePlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlanTarget,
} from '../controllers/planControllers.js';

const planRouter = express.Router();

planRouter.post('/plans', createOrUpdatePlan);

planRouter.get('/plans', getPlans);

// Make sure /plans/target route is before /plans/:id
planRouter.get('/plans/target', getPlanTarget);

planRouter.get('/plans/:id', getPlanById);

planRouter.put('/plans/:id', updatePlan);

planRouter.delete('/plans/:id', deletePlan);


export default planRouter;
