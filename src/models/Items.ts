// models/Items.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';
import Item_images from "./Item_images";
import Discount from './Discount';

// 1. 所有欄位定義
interface IItemAttributes {
    id: number;
    sub_title_id: number;
    name: string;
    price: string;
    storage: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 2. 建立資料時，哪些欄位是選填（如 id, createdAt, deletedAt）
interface ItemCreationAttributes extends Optional<IItemAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 3. 定義類別
class Item extends Model<IItemAttributes, ItemCreationAttributes>
    implements IItemAttributes {
    public id!: number;
    public sub_title_id!: number;
    public name!: string;
    public price!: string;
    public storage!: number;
    public description!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 4. 初始化 Model
Item.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        sub_title_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        storage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Items',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

// 建立關聯
Item.hasMany(Item_images, { foreignKey: "item_id", as: "images" });
// 建立折扣關聯
Item.hasMany(Discount, { foreignKey: "item_id", as: "discounts" });

export default Item;
