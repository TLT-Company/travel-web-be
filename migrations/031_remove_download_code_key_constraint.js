import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Remove the unique constraint with the correct name
  try {
    await queryInterface.removeConstraint(
      "document_export_histories",
      "document_export_histories_download_code_key"
    );
    console.log(
      "✅ Removed unique constraint document_export_histories_download_code_key"
    );
  } catch (error) {
    console.log("Error removing constraint:", error.message);
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Add back the unique constraint
  try {
    await queryInterface.addConstraint("document_export_histories", {
      fields: ["download_code"],
      type: "unique",
      name: "document_export_histories_download_code_key",
    });
    console.log(
      "✅ Added back unique constraint document_export_histories_download_code_key"
    );
  } catch (error) {
    console.log("Error adding unique constraint:", error.message);
  }
};
