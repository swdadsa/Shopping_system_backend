
import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import sequelize from '../../config/sequelize';
interface IItemPopularityAttributes {
    id: number;
    item_id: number;
    order: number;
    path: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 2. 建立時可省略欄位
interface ItemPopularityCreationAttributes extends Optional<IItemPopularityAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

class ItemPopularity extends Model<IItemPopularityAttributes, ItemPopularityCreationAttributes> implements IItemPopularityAttributes {
    public id!: number;
    public item_id!: number;
    public order!: number;
    public path!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

ItemPopularity.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'Item_popularity',
    freezeTableName: true,
    timestamps: true,
    paranoid: true
});

export default ItemPopularity