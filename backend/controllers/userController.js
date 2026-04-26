import { getDB } from "../database/db.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.SECRET_KEY;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/user",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS
});

const createAccessToken = (user) => jwt.sign(
    { sub: user.id, email: user.email, type: "access" },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
);

const createRefreshToken = (user) => jwt.sign(
    { sub: user.id, type: "refresh" },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
);

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
            return res.status(401).json({
                success: false,
                message: "Incorrect Password"
            })
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions());

        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.username || user.email}`,
            accessToken,
            user: sanitizeUser(user)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        const db = getDB();
        const incomingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                code: "REFRESH_TOKEN_MISSING",
                message: "Refresh token is missing"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                code: "INVALID_REFRESH_TOKEN",
                message: "Refresh token is invalid or expired"
            });
        }

        if (decoded.type !== "refresh") {
            return res.status(401).json({
                success: false,
                code: "INVALID_REFRESH_TOKEN",
                message: "Refresh token is invalid"
            });
        }

        const [userRows] = await db.execute(
            "SELECT id, username, email, avatar FROM users WHERE id = ? LIMIT 1",
            [decoded.sub]
        );

        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                code: "INVALID_REFRESH_TOKEN",
                message: "User no longer exists"
            });
        }

        const user = userRows[0];
        const accessToken = createAccessToken(user);
        const nextRefreshToken = createRefreshToken(user);

        res.cookie(REFRESH_TOKEN_COOKIE, nextRefreshToken, getRefreshCookieOptions());

        return res.status(200).json({
            success: true,
            accessToken,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshCookieOptions());

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