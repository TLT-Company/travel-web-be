export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("document_customer");

  if (!table.file_name) {
    await queryInterface.addColumn("document_customer", "file_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("document_customer", "file_name");
}
