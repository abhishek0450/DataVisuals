import xlsx from 'xlsx';
import fs from 'fs';
import { getDB } from '../database/db.js';
import { ownsWorkspace, parsePositiveInt } from '../helpers/authorization.js';

export const uploadDataset = async (req, res) => {
    try {
        const workspaceId = parsePositiveInt(req.body.workspace_id);
        const file = req.file;
        const userId = req.userId;

        if (!file || !workspaceId) {
            if (file) fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'File and valid workspace_id are required' });
        }

        const canAccessWorkspace = await ownsWorkspace(workspaceId, userId);
        if (!canAccessWorkspace) {
            fs.unlinkSync(file.path);
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        // Parse file using xlsx
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (rawData.length === 0) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'Uploaded file is empty' });
        }

        // Infer schema from first up to 10 rows
        const sampleRows = rawData.slice(0, 10);
        const schemaMap = {};

        // Initialize schemaMap with default strings
        for (const key in rawData[0]) {
            schemaMap[key] = { key, label: key, type: 'string' };
        }
        
        // Analyze samples to refine types
        sampleRows.forEach(row => {
            for (const key in row) {
                const val = row[key];
                if (val === null || val === undefined || val === '') continue;

                if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
                    schemaMap[key].type = 'number';
                } else if (val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)) && isNaN(Number(val)))) {
                    schemaMap[key].type = 'date';
                }
            }
        });

        const columnsSchema = Object.values(schemaMap);

        // Connect to DB and Store
        const pool = getDB();

        const [result] = await pool.query(
            "INSERT INTO datasets (user_id, workspace_id, name, columns_schema, raw_data) VALUES (?, ?, ?, ?, ?)",
            [userId, workspaceId, file.originalname, JSON.stringify(columnsSchema), JSON.stringify(rawData)]
        );

        // Cleanup temp file
        fs.unlinkSync(file.path);

        res.status(201).json({
            success: true,
            message: 'Dataset uploaded successfully',
            dataset: {
                id: result.insertId,
                name: file.originalname,
                columns_schema: columnsSchema
            }
        });

    } catch (error) {
        console.error('Upload dataset error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: 'Failed to upload dataset: ' + error.message });
    }
};

export const getDatasets = async (req, res) => {
    try {
        const workspaceId = parsePositiveInt(req.params.workspaceId);
        const userId = req.userId;

        if (!workspaceId) {
            return res.status(400).json({ success: false, message: 'Invalid workspace id' });
        }

        const canAccessWorkspace = await ownsWorkspace(workspaceId, userId);
        if (!canAccessWorkspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const pool = getDB();
        
        // Fetch datasets without raw_data to save bandwidth for list view
        const [datasets] = await pool.query(
            "SELECT id, name, columns_schema, created_at FROM datasets WHERE workspace_id = ? AND user_id = ?",
            [workspaceId, userId]
        );

        res.status(200).json({ success: true, datasets });
    } catch (error) {
        console.error('Get datasets error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch datasets' });
    }
};

export const getDatasetData = async (req, res) => {
    try {
        const datasetId = parsePositiveInt(req.params.id);
        const userId = req.userId;

        if (!datasetId) {
            return res.status(400).json({ success: false, message: 'Invalid dataset id' });
        }

        const pool = getDB();
        
        const [datasets] = await pool.query(
             "SELECT id, name, columns_schema, raw_data FROM datasets WHERE id = ? AND user_id = ?",
            [datasetId, userId]
        );

        if (datasets.length === 0) {
            return res.status(404).json({ success: false, message: 'Dataset not found' });
        }

        res.status(200).json({ success: true, dataset: datasets[0] });
    } catch (error) {
        console.error('Get dataset data error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dataset data' });
    }
};

export const deleteDataset = async (req, res) => {
    try {
        const datasetId = parsePositiveInt(req.params.id);
        if (!datasetId) {
            return res.status(400).json({ success: false, message: 'Invalid dataset id' });
        }

        const pool = getDB();
        
        const [result] = await pool.query(
            "DELETE FROM datasets WHERE id = ? AND user_id = ?",
            [datasetId, req.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Dataset not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Dataset deleted successfully' });
    } catch (error) {
        console.error('Delete dataset error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete dataset' });
    }
};
