import express from "express"
import { loginUser, logoutUser, registerUser, getUserProfile } from "../controllers/userController.js"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { userSchema, validateUser } from "../validators/userValidate.js"

const router = express.Router()

router.post('/register', validateUser(userSchema), registerUser)
router.post('/login', loginUser)
router.post('/logout', isAuthenticated, logoutUser)
router.get('/me', isAuthenticated, getUserProfile)

export default router