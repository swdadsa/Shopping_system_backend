// models/Item_images.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 1. 定義完整資料表欄位
interface IItemImageAttributes {
    id: number;
    item_id: number;
    order: number;
    path: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 2. 建立時可省略欄位
interface ItemImageCreationAttributes extends Optional<IItemImageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 3. 定義 model 類別
class ItemImage extends Model<IItemImageAttributes, ItemImageCreationAttributes>
    implements IItemImageAttributes {
    public id!: number;
    public item_id!: number;
    public order!: number;
    public path!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 4. 初始化
ItemImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Item_images',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

export default ItemImage;