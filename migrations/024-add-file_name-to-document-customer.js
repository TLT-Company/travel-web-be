export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("DocumentCustomer");

  if (!table.file_name) {
    await queryInterface.addColumn("DocumentCustomer", "file_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("DocumentCustomer", "file_name");
}
