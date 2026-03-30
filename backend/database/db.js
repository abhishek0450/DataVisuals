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
    await pool.query(`
        CREATE TABLE IF NOT EXISTS workspaces (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS datasets (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            workspace_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            columns_schema JSON,
            raw_data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS charts (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            workspace_id BIGINT UNSIGNED NOT NULL,
            dataset_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            config JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
            FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
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

        const Connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
        });

        await Connection.query("CREATE DATABASE IF NOT EXISTS ??", [database]);
        await Connection.end();

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
        throw new Error("Database failed to connect");
    }

    return pool;
};

export default connectDB;