import jwt from 'jsonwebtoken'
import { getDB } from '../database/db.js';

export const isAuthenticated = async(req, res, next) =>{
    try {
        const db = getDB();
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                success:false,
                message:'Access token is missing or invalid'
            })
        }

        const token = authHeader.split(" ")[1]
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            return res.status(401).json({
                success:false,
                message:"Token has expired or is invalid"
            })
        }

        const { id } = decoded;
        const [users] = await db.execute(
            "SELECT id, username, email, avatar FROM users WHERE id = ? LIMIT 1",
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }

        req.user = users[0];
        req.userId = users[0].id
        next()
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}