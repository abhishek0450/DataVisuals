import { getDB } from '../database/db.js';

export const parsePositiveInt = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
};

export const ownsWorkspace = async (workspaceId, userId) => {
    const db = getDB();
    const [rows] = await db.query(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ? LIMIT 1',
        [workspaceId, userId]
    );

    return rows.length > 0;
};

export const ownsDataset = async (datasetId, userId) => {
    const db = getDB();
    const [rows] = await db.query(
        'SELECT id FROM datasets WHERE id = ? AND user_id = ? LIMIT 1',
        [datasetId, userId]
    );

    return rows.length > 0;
};

export const ownsDatasetInWorkspace = async (datasetId, workspaceId, userId) => {
    const db = getDB();
    const [rows] = await db.query(
        'SELECT id FROM datasets WHERE id = ? AND workspace_id = ? AND user_id = ? LIMIT 1',
        [datasetId, workspaceId, userId]
    );

    return rows.length > 0;
};