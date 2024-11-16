import { Dialect } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

export const development = {
    host: String(process.env.AWS_DB_HOST),
    database: String(process.env.AWS_DB_NAME),
    username: String(process.env.AWS_DB_USER),
    password: String(process.env.AWS_DB_PASSWORD),
    dialect: "mysql" as Dialect,
    migrationStoragePath: "src/migrations",
    seederStoragePath: "src/seeders",
    timezone: '+08:00',
    ssl: {
        rejectUnauthorized: true // 忽略 SSL 驗證
    },
};

