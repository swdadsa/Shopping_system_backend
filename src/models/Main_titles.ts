// models/MainTitle.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';
import Sub_title from "../models/Sub_titles";

// 宣告資料表欄位介面
interface IMainTitleAttributes {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 建立時可省略的欄位（如 id, createdAt 等）
interface IMainTitleCreationAttributes extends Optional<IMainTitleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 宣告 Model class
class MainTitle extends Model<IMainTitleAttributes, IMainTitleCreationAttributes>
    implements IMainTitleAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 初始化 Sequelize Model
MainTitle.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
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
        tableName: 'Main_titles',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

// 建立關聯
MainTitle.hasMany(Sub_title, {
    foreignKey: "main_title_id"
})

export default MainTitle;