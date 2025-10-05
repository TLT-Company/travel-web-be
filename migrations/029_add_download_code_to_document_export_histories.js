import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Check if column already exists
  const tableDescription = await queryInterface.describeTable(
    "document_export_histories"
  );

  if (!tableDescription.download_code) {
    // Add column if it doesn't exist
    await queryInterface.addColumn(
      "document_export_histories",
      "download_code",
      {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Mã download duy nhất cho file export",
      }
    );
  }

  // No unique constraint needed for download_code
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Remove the column
  try {
    await queryInterface.removeColumn(
      "document_export_histories",
      "download_code"
    );
  } catch (error) {
    console.log("Column might not exist:", error.message);
  }
};
