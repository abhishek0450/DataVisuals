import express from 'express';
import multer from 'multer';
import { uploadDataset, getDatasets, getDatasetData, deleteDataset } from '../controllers/datasetController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();
const upload = multer({ dest: uploadDir });

// Upload a new dataset
router.post('/upload', isAuthenticated, upload.single('file'), uploadDataset);

// Get list of datasets (metadata only) for a workspace
router.get('/workspace/:workspaceId', isAuthenticated, getDatasets);

// Get full dataset (with raw JSON data) by dataset ID
router.get('/:id', isAuthenticated, getDatasetData);

// Delete dataset
router.delete('/:id', isAuthenticated, deleteDataset);

export default router;
