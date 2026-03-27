import { getDB } from "../database/db.js";

const createWorkspace = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        const db = getDB();
        const [result] = await db.execute(
            "INSERT INTO workspaces (user_id, name) VALUES (?, ?)",
            [userId, name]
        );

        res.json({ id: result.insertId, name });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = getDB();

        const [workspaces] = await db.execute(
            "SELECT * FROM workspaces WHERE user_id = ?",
            [userId]
        );

        res.json(workspaces);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSingleWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const db = getDB();

        const [rows] = await db.execute(
            "SELECT * FROM workspaces WHERE id = ? AND user_id = ?",
            [id, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSingleWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const db = getDB();

        const [rows] = await db.execute(
            "DELETE FROM workspaces WHERE id = ? AND user_id = ?",
            [id, userId]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Workspace not found" });

        res.json({ message: "Workspace deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { createWorkspace, getUserWorkspaces, getSingleWorkspace, deleteSingleWorkspace };