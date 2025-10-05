import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Remove the unique constraint if it exists
  try {
    await queryInterface.removeConstraint(
      "document_export_histories",
      "document_export_histories_download_code_unique"
    );
    console.log("✅ Removed unique constraint from download_code");
  } catch (error) {
    console.log("Unique constraint might not exist:", error.message);
  }
};

export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Add back the unique constraint
  try {
    await queryInterface.addConstraint("document_export_histories", {
      fields: ["download_code"],
      type: "unique",
      name: "document_export_histories_download_code_unique",
    });
    console.log("✅ Added back unique constraint to download_code");
  } catch (error) {
    console.log("Error adding unique constraint:", error.message);
  }
};
