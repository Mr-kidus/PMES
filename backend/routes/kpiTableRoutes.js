import express from 'express';
import { getKPITableData } from '../controllers/kpiTableController.js';

const KpiTableRouter = express.Router();

// GET /api/kpi-table-data/table-data
// Query params expected: userId, role, year, sectorId, optional subsectorId
KpiTableRouter.get('/table-data', getKPITableData);

export default KpiTableRouter;
 