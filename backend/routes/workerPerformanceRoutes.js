import express from 'express';
import { submitWorkerPerformance, getWorkerPerformanceFiles } from '../controllers/workerPerformanceController.js';
import authUser from '../middlewares/authUser.js';
import { upload } from '../middlewares/multer.js';

const WorkerPerformanceRouter = express.Router();

WorkerPerformanceRouter.post('/submit-performance', authUser, upload.single('file'), submitWorkerPerformance);

WorkerPerformanceRouter.get('/files', authUser, getWorkerPerformanceFiles);

export default WorkerPerformanceRouter;
