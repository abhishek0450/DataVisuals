import express from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser, getUserProfile } from "../controllers/userController.js"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { userSchema, validateUser } from "../validators/userValidate.js"

const router = express.Router()

router.post('/register', validateUser(userSchema), registerUser)
router.post('/login', loginUser)
router.post('/refresh', refreshAccessToken)
router.post('/logout', logoutUser)
router.get('/me', isAuthenticated, getUserProfile)

export default router