// models/Order_list_detail.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';
import Item_images from "../models/Item_images";

// 欄位介面
interface IOrderListDetailAttributes {
    id: number;
    order_list_id: number;
    item_id: number;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 用於 create 時的 Optional 欄位（如 id, createdAt 等自動產生的）
interface OrderListDetailCreationAttributes extends Optional<IOrderListDetailAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 定義類別
class OrderListDetail extends Model<IOrderListDetailAttributes, OrderListDetailCreationAttributes> implements IOrderListDetailAttributes {
    public id!: number;
    public order_list_id!: number;
    public item_id!: number;
    public amount!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 初始化模型
OrderListDetail.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_list_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Order_list_detail',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

// 建立關聯
OrderListDetail.hasMany(Item_images, {
    foreignKey: "item_id",
    as: "images",
});



export default OrderListDetail;