import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';
import UserRole from './User_role';

interface IUserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
// 建立新使用者時只需要以下欄位，其他由 DB 自動產生
interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public isVerified!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date | null;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        isVerified: DataTypes.BOOLEAN,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'Users',
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
    }
);

//建立User role 關聯
User.hasMany(UserRole, { foreignKey: 'user_id' });

export default User;