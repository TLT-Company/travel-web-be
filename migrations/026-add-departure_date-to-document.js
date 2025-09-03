export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("document");

  if (!table.departure_date) {
    await queryInterface.addColumn("document", "departure_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.removeColumn("document", "departure_date");
    console.log("Removed column: departure_date");
  } catch (error) {
    console.log("Column departure_date does not exist or already removed");
  }
}
