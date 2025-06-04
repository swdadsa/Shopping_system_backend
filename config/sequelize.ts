// src/config/sequelize.ts
import { Sequelize } from 'sequelize';
import { development } from './config'; // 你的 config/config.ts 檔案

const sequelize = new Sequelize(
    development.database,
    development.username,
    development.password,
    {
        host: development.host,
        dialect: development.dialect,
        timezone: development.timezone,
        dialectOptions: {
            // 可選：MySQL-specific options
        },
        logging: false, // 可選：關閉 SQL log 輸出
    }
);

export default sequelize;
