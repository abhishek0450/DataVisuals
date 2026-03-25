import { getDB } from "../database/db.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const sanitizeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar
});

export const registerUser = async (req, res) => {
    try {
        const db = getDB();
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        
        const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const [insertResult] = await db.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );
        
        const userId = insertResult.insertId;
        
        const [newUserRows] = await db.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: sanitizeUser(newUserRows[0])
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const db = getDB();
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }
        
        const [userRows] = await db.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access"
            })
        }
        
        const user = userRows[0];
        
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account was created using Google. Use Google login."
            })
        }
        
        const passwordCheck = await bcrypt.compare(password, user.password)
        if (!passwordCheck) {
            return res.status(402).json({
                success: false,
                message: "Incorrect Password"
            })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET_KEY, { expiresIn: "10d" })

        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.username || user.email}`,
            token,
            user: sanitizeUser(user)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logoutUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: sanitizeUser(req.user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}