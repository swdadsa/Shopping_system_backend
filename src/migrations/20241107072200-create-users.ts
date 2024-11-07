import { DataTypes, Sequelize } from "sequelize";

export default {
  up: async (queryInterface: any) => {
    await queryInterface.createTable("Users", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permissions: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable("Users");
  }
};
