import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 定義資料表欄位的 interface
interface IOrderListAttributes {
    id: number;
    order_unique_number: string;
    user_id: number;
    condition: number;
    total_price: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 可在建立時忽略的欄位（例如 auto-increment id）
interface IOrderListCreationAttributes extends Optional<IOrderListAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 定義模型 class
class OrderList extends Model<IOrderListAttributes, IOrderListCreationAttributes> implements IOrderListAttributes {
    public id!: number;
    public order_unique_number!: string;
    public user_id!: number;
    public condition!: number;
    public total_price!: number | null;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 初始化模型
OrderList.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_unique_number: {
            type: DataTypes.STRING,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        condition: {
            type: DataTypes.STRING,
        },
        total_price: {
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
        },
    },
    {
        sequelize,
        tableName: 'Order_list',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

export default OrderList;