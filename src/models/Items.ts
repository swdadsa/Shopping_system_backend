import { DataTypes, Sequelize } from 'sequelize';
import { development } from '../../config/config'

let sequelize = new Sequelize(development.database, development.username, development.password, {
    host: development.host,
    timezone: development.timezone,
    dialect: development.dialect,
    dialectOptions: {
        // Your mysql2 options here
    },
});

let Items = sequelize.define('items', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    sub_title_id: {
        type: DataTypes.INTEGER,
    },
    name: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.STRING,
    },
    storage: {
        type: DataTypes.INTEGER,
    },
    description: {
        type: DataTypes.STRING,
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
    tableName: 'items', // 指定現有資料表名
    freezeTableName: true, // 不要讓 Sequelize 自動改變表名
    timestamps: true, // 如果沒有 `createdAt` 和 `updatedAt` 欄位，關閉時間戳
    paranoid: true,// deletedAt 軟刪除
});

export default Items