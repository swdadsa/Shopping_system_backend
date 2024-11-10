import { DataTypes, Sequelize } from 'sequelize';
import { development } from '../../config/config'

var sequelize = new Sequelize(development.database, development.username, development.password, {
    timezone: development.timezone,
    dialect: development.dialect,
    dialectOptions: {
        // Your mysql2 options here
    },
});

var User_token = sequelize.define('User_token', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.STRING,
    },
    token: {
        type: DataTypes.STRING,
    },
    expiredAt: {
        type: DataTypes.DATE,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
    deletedAt: {
        type: DataTypes.DATE,
    }
}, {
    tableName: 'User_token', // 指定現有資料表名
    freezeTableName: true, // 不要讓 Sequelize 自動改變表名
    timestamps: true, // 如果沒有 `createdAt` 和 `updatedAt` 欄位，關閉時間戳
    paranoid: true,// deletedAt 軟刪除
});

export default User_token