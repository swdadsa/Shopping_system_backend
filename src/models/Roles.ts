// models/UserToken.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';
import UserRole from './User_role';

// 1. 宣告完整欄位介面
interface IRolesAttributes {
    id: number;
    name: string;
    chinese_name: string;
    permission: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// 2. 宣告建立時允許省略的欄位（例如 id 自動產生，timestamps 自動處理）
interface IRolesCreationAttributes extends Optional<IRolesAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 3. 宣告 class 並繼承 Sequelize Model
class Roles extends Model<IRolesAttributes, IRolesCreationAttributes> implements IRolesAttributes {
    public id!: number;
    public name!: string;
    public chinese_name!: string;
    public permission!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

// 4. 初始化 Model
Roles.init({
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
    chinese_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    permission: {
        type: DataTypes.NUMBER,
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
    tableName: 'Roles',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
});

// 建立關聯
Roles.hasMany(UserRole, { foreignKey: 'id' });
UserRole.belongsTo(Roles, { foreignKey: 'role_id' });

export default Roles;
