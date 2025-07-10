// models/UserToken.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';
import Roles from './Roles';

// 1. 宣告完整欄位介面
interface IUserRoleAttributes {
    id: number;
    user_id: number;
    role_id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 2. 宣告建立時允許省略的欄位（例如 id 自動產生，timestamps 自動處理）
interface IUserRoleCreationAttributes extends Optional<IUserRoleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 3. 宣告 class 並繼承 Sequelize Model
class UserRole extends Model<IUserRoleAttributes, IUserRoleCreationAttributes> implements IUserRoleAttributes {
    public id!: number;
    public user_id!: number;
    public role_id!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 4. 初始化 Model
UserRole.init({
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
    role_id: {
        type: DataTypes.STRING,
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
    tableName: 'User_role',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
});

export default UserRole;
