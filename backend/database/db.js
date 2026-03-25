import mysql from "mysql2/promise";

let pool;

const createTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            username VARCHAR(100) NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NULL,
            avatar TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB;
    `);
};

const connectDB = async () => {
    try {
        const host = process.env.MYSQL_HOST || "localhost";
        const port = Number(process.env.MYSQL_PORT || 3306);
        const user = process.env.MYSQL_USER || "root";
        const password = process.env.MYSQL_PASSWORD || "";
        const database = process.env.MYSQL_DATABASE || "note_app";

        const adminConnection = await mysql.createConnection({
            host,
            port,
            user,
            password,
        });

        await adminConnection.query("CREATE DATABASE IF NOT EXISTS ??", [database]);
        await adminConnection.end();

        pool = mysql.createPool({
            host,
            port,
            user,
            password,
            database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        await pool.query("SELECT 1");
        await createTables();

        console.log("MySQL connected successfully");
    } catch (error) {
        console.log("MySQL connection error", error);
    }
};

export const getDB = () => {
    if (!pool) {
        throw new Error("Database is not connected. Call connectDB first.");
    }

    return pool;
};

export default connectDB;