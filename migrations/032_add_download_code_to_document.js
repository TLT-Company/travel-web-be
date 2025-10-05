import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Check if column already exists
  const tableDescription = await queryInterface.describeTable("document");

  if (!tableDescription.download_code) {
    // Add column if it doesn't exist
    await queryInterface.addColumn("document", "download_code", {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Mã download cho document",
    });
    console.log("✅ Added download_code column to document table");
  } else {
    console.log("download_code column already exists in document table");
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Remove the column
  try {
    await queryInterface.removeColumn("document", "download_code");
    console.log("✅ Removed download_code column from document table");
  } catch (error) {
    console.log("Column might not exist:", error.message);
  }
};
