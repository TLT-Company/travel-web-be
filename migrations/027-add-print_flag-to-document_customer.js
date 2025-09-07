export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("document_customer");

  if (!table.print_flag) {
    await queryInterface.addColumn("document_customer", "print_flag", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.removeColumn("document_customer", "print_flag");
    console.log("Removed column: print_flag");
  } catch (error) {
    console.log("Column print_flag does not exist or already removed");
  }
}
