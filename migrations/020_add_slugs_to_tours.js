"use strict";

export async function up(queryInterface, Sequelize) {
  const table = "tours";
  const tableDefinition = await queryInterface.describeTable(table);

  if (!tableDefinition.role) {
    await queryInterface.addColumn(table, "slug_name", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn(table, "slug_location", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const table = "tours";
  await queryInterface.removeColumn(table, "slug_name");
  await queryInterface.removeColumn(table, "slug_location");
}
