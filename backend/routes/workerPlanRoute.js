import express from 'express';
import { getWorkerPlans, getCeoWorkerPlans } from '../controllers/workerPlanController.js';
import authUser from '../middlewares/authUser.js';

const workerPlanRouter = express.Router();

// Normal plans endpoint (for all users, including CEO but only own plans or filtered by workerId if allowed)
workerPlanRouter.get('/', authUser, getWorkerPlans);

// CEO reports endpoint, CEO only, allows fetching other workers in subsector
workerPlanRouter.get('/ceo', authUser, getCeoWorkerPlans);

export default workerPlanRouter;
