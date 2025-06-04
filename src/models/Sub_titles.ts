// models/SubTitle.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 宣告欄位結構
interface ISubTitleAttributes {
    id: number;
    main_title_id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 建立時可省略的欄位
interface ISubTitleCreationAttributes
    extends Optional<ISubTitleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 定義 Model 類別
class SubTitle extends Model<ISubTitleAttributes, ISubTitleCreationAttributes>
    implements ISubTitleAttributes {
    public id!: number;
    public main_title_id!: number;
    public name!: string;
    public description!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 初始化 Model
SubTitle.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        main_title_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // 根據你的需求調整是否允許 null
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
        tableName: 'Sub_titles',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

export default SubTitle;