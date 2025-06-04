// models/UserToken.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 1. 宣告完整欄位介面
interface IUserTokenAttributes {
    id: number;
    user_id: number;
    token: string;
    expiredAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 2. 宣告建立時允許省略的欄位（例如 id 自動產生，timestamps 自動處理）
interface IUserTokenCreationAttributes extends Optional<IUserTokenAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 3. 宣告 class 並繼承 Sequelize Model
class UserToken extends Model<IUserTokenAttributes, IUserTokenCreationAttributes> implements IUserTokenAttributes {
    public id!: number;
    public user_id!: number;
    public token!: string;
    public expiredAt!: Date;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 4. 初始化 Model
UserToken.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
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
    sequelize,
    tableName: 'User_token',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
});

export default UserToken;
