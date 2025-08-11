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
  await queryInterface.removeColumn(table, "slug_name");
  await queryInterface.removeColumn(table, "slug_location");
}
