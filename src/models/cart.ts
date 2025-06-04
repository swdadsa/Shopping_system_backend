import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 定義欄位型別
interface CartAttributes {
    id: number;
    user_id: number;
    item_id: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

// 定義可選欄位
interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 建立 model class
class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    public id!: number;
    public user_id!: number;
    public item_id!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 初始化 model
Cart.init(
    {
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
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Cart',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

export default Cart;
