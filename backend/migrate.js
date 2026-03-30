import 'dotenv/config';
import connectDB, { getDB } from './database/db.js';

(async () => {
    try {
        await connectDB();
        const pool = getDB();
        console.log("Dropping tables to sync correct schema...");
        await pool.query('DROP TABLE IF EXISTS charts');
        await pool.query('DROP TABLE IF EXISTS datasets');
        
        console.log("Recreating tables using updated schema...");
        await connectDB();
        
        console.log("Migration completely successful!");
        process.exit(0);
    } catch(err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
})();
