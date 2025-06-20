import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/sequelize';

// 定義欄位型別
interface DiscountAttributes {
  id: number;
  item_id: number;
  discountNumber: string;
  discountPercent: string;
  startAt: Date;
  endAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// 定義可選欄位
interface DiscountCreationAttributes extends Optional<DiscountAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

// 建立 model class
class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> implements DiscountAttributes {
  public id!: number;
  public user_id!: number;
  public item_id!: number;
  public discountNumber!: string;
  public discountPercent!: string;
  public startAt!: Date;
  public endAt!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;
}

// 初始化 model
Discount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item_id: {
      type: DataTypes.INTEGER,
    },
    discountNumber: {
      type: DataTypes.STRING,
    },
    discountPercent: {
      type: DataTypes.STRING,
    },
    startAt: {
      type: DataTypes.DATE,
    },
    endAt: {
      type: DataTypes.DATE,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'Discount',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
  }
);

export default Discount;
