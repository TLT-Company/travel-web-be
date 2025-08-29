"use strict";

export async function up(queryInterface, Sequelize) {
  const table = "users";
  const tableDefinition = await queryInterface.describeTable(table);

  if (!tableDefinition.role) {
    await queryInterface.addColumn(table, "role", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "user",
    });
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.removeColumn("users", "role");
    console.log("Removed column: role");
  } catch (error) {
    console.log("Column role does not exist or already removed");
  }
}
