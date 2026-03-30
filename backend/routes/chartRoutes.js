import express from 'express';
import { saveChart, getWorkspaceCharts } from '../controllers/chartController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

router.post('/', isAuthenticated, saveChart);

router.get('/workspace/:workspaceId', isAuthenticated, getWorkspaceCharts);

export default router;
