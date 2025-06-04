import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 定義屬性 interface
interface AdvertisementAttributes {
    id: number;
    item_id?: number | null;
    image_path: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

// 定義可選參數 interface（for create）
interface AdvertisementCreationAttributes extends Optional<AdvertisementAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 擴充 Model
class Advertisement extends Model<AdvertisementAttributes, AdvertisementCreationAttributes>
    implements AdvertisementAttributes {
    public id!: number;
    public item_id!: number | null;
    public image_path!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date;
}

Advertisement.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    },
    {
        sequelize,
        tableName: 'Advertisement',
        freezeTableName: true,
        timestamps: true,
        paranoid: true
    }
);

export default Advertisement;
