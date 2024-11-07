// import { Sequelize } from "sequelize"

// export class database {
//     sequelize = new Sequelize('ERP', 'ERP_USER', 'ShiCheng1999$', {
//         host: '127.0.0.1',
//         dialect: 'mssql',
//         dialectOptions: {
//             options: {
//                 encrypt: false,
//                 trustServerCertificate: false
//             }
//         }
//     });
// }

import { Dialect } from "sequelize";

export const development = {
    username: "ERP_USER",
    password: "ShiCheng1999$",
    database: "ERP",
    host: "localhost",
    dialect: "mysql" as Dialect,
    migrationStoragePath: "src/migrations",
    seederStoragePath: "src/seeders",
    ssl: {
        rejectUnauthorized: false // 忽略 SSL 驗證
    }
};

