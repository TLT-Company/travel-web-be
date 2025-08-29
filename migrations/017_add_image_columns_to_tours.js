import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tableDefinition = await queryInterface.describeTable("tours");

  for (let i = 1; i <= 10; i++) {
    const columnName = `image_url_${i}`;
    if (!tableDefinition[columnName]) {
      await queryInterface.addColumn("tours", columnName, {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  for (let i = 1; i <= 10; i++) {
    const columnName = `image_url_${i}`;
    try {
      await queryInterface.removeColumn("tours", columnName);
      console.log(`Removed column: ${columnName}`);
    } catch (error) {
      console.log(`Column ${columnName} does not exist or already removed`);
    }
  }
};
