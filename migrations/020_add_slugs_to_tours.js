"use strict";

export async function up(queryInterface, Sequelize) {
  const table = "tours";
  const tableDefinition = await queryInterface.describeTable(table);

  if (!tableDefinition.role) {
    if (!tableDefinition.slug_name) {
      await queryInterface.addColumn(table, "slug_name", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      });
    }

    if (!tableDefinition.slug_location) {
      await queryInterface.addColumn(table, "slug_location", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      });
    }
  }
}

export async function down(queryInterface, Sequelize) {
  const table = "tours";

  try {
    await queryInterface.removeColumn(table, "slug_name");
    console.log("Removed column: slug_name");
  } catch (error) {
    console.log("Column slug_name does not exist or already removed");
  }

  try {
    await queryInterface.removeColumn(table, "slug_location");
    console.log("Removed column: slug_location");
  } catch (error) {
    console.log("Column slug_location does not exist or already removed");
  }
}
