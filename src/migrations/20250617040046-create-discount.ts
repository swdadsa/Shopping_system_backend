import { DataTypes, Sequelize } from "sequelize";

export default {
  up: async (queryInterface: any) => {
    await queryInterface.createTable("Discount", {
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
      discountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discountPercent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endAt: {
        type: DataTypes.DATE,
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
    });
  },

  down: async (queryInterface: any) => {
    await queryInterface.dropTable("Discount");
  }
};
