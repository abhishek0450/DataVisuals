import jwt from 'jsonwebtoken'
import { getDB } from '../database/db.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY;

export const isAuthenticated = async (req, res, next) => {
    try {
        const db = getDB();
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                code: 'ACCESS_TOKEN_MISSING',
                message: 'Access token is missing or invalid'
            })
        }

        const token = authHeader.split(" ")[1]
        let decoded;

        try {
            decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        } catch (err) {
            const code = err?.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_ACCESS_TOKEN';
            return res.status(401).json({
                success: false,
                code,
                message: "Token has expired or is invalid"
            })
        }

        if (decoded?.type !== 'access') {
            return res.status(401).json({
                success: false,
                code: 'INVALID_ACCESS_TOKEN',
                message: 'Invalid access token type'
            })
        }

        const userId = decoded.sub || decoded.id;
        const [users] = await db.execute(
            "SELECT id, username, email, avatar FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        req.user = users[0];
        req.userId = users[0].id
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

