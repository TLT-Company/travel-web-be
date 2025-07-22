import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  for (let i = 1; i <= 10; i++) {
    await queryInterface.addColumn("tours", `image_url_${i}`, {
      type: DataTypes.STRING,
      allowNull: true,
    })
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  for (let i = 1; i <= 10; i++) {
    await queryInterface.removeColumn("tours", `image_url_${i}`);
  }
};
