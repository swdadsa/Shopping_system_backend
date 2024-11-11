import { Dialect } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

export const development = {
    host: String(process.env.DEFAULT_DB_NAME),
    database: String(process.env.DEFAULT_DB_NAME),
    username: String(process.env.DEFAULT_DB_USER),
    password: String(process.env.DEFAULT_DB_PASSWORD),
    dialect: "mysql" as Dialect,
    migrationStoragePath: "src/migrations",
    seederStoragePath: "src/seeders",
    timezone: '+08:00',
    ssl: {
        rejectUnauthorized: false // 忽略 SSL 驗證
    },
};

