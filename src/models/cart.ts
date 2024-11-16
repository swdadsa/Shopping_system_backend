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

let Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    item_id: {
        type: DataTypes.INTEGER,
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
    tableName: 'Cart', // 指定現有資料表名
    freezeTableName: true, // 不要讓 Sequelize 自動改變表名
    timestamps: true, // 如果沒有 `createdAt` 和 `updatedAt` 欄位，關閉時間戳
    paranoid: true,// deletedAt 軟刪除
});

export default Cart