import express from 'express';
import { assignMeasure } from '../controllers/measureAssignmentController.js';
import authUser from '../middlewares/authUser.js'; // import your auth middleware

const measureAssignmentRouter = express.Router();

console.log("📦 measureAssignmentRouter loaded");

// Protect the route with authUser middleware
measureAssignmentRouter.post('/', authUser, assignMeasure);

export default measureAssignmentRouter;
