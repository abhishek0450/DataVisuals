import { getDB } from '../database/db.js';
import { ownsDatasetInWorkspace, ownsWorkspace, parsePositiveInt } from '../helpers/authorization.js';

export const saveChart = async (req, res) => {
    try {
        const { workspace_id, dataset_id, name, type, config } = req.body;
        const workspaceId = parsePositiveInt(workspace_id);
        const datasetId = parsePositiveInt(dataset_id);
        const userId = req.userId;

        if (!workspaceId || !datasetId || !name || !type || !config) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const canAccessWorkspace = await ownsWorkspace(workspaceId, userId);
        if (!canAccessWorkspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        const canAccessDataset = await ownsDatasetInWorkspace(datasetId, workspaceId, userId);
        if (!canAccessDataset) {
            return res.status(404).json({ success: false, message: 'Dataset not found' });
        }

        const pool = getDB();

        const [result] = await pool.query(
            "INSERT INTO charts (workspace_id, dataset_id, name, type, config) VALUES (?, ?, ?, ?, ?)",
            [workspaceId, datasetId, name, type, JSON.stringify(config)]
        );

        res.status(201).json({
            success: true,
            message: 'Chart saved successfully',
            chartId: result.insertId
        });
    } catch (error) {
        console.error('Save chart error:', error);
        res.status(500).json({ success: false, message: 'Failed to save chart: ' + error.message });
    }
};

export const getWorkspaceCharts = async (req, res) => {
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
        
        // Fetch charts AND their associated dataset's raw_data and schema in one shot
        const [charts] = await pool.query(`
            SELECT 
                c.id as chart_id, c.name as chart_name, c.type as chart_type, c.config, 
                d.id as dataset_id, d.name as dataset_name, d.columns_schema, d.raw_data 
            FROM charts c
            JOIN datasets d ON c.dataset_id = d.id
            JOIN workspaces w ON c.workspace_id = w.id
            WHERE c.workspace_id = ? AND w.user_id = ?
            ORDER BY c.created_at DESC
        `, [workspaceId, userId]);

        res.status(200).json({ success: true, charts });
    } catch (error) {
        console.error('Get charts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch charts: ' + error.message });
    }
};
