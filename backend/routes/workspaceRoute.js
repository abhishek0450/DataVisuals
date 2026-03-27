import express from "express"
import { createWorkspace, getUserWorkspaces, getSingleWorkspace, deleteSingleWorkspace } from "../controllers/workspaceController.js"
import { isAuthenticated } from "../middleware/isAuthenticated.js"

const router = express.Router()

router.post('/', isAuthenticated, createWorkspace)
router.get('/', isAuthenticated, getUserWorkspaces)
router.get('/:id', isAuthenticated, getSingleWorkspace)
router.delete('/:id', isAuthenticated, deleteSingleWorkspace)

export default router
