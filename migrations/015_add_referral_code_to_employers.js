export async function up(queryInterface, Sequelize) {
  const table = "employers";
  const column = "referral_code";

  // Kiểm tra cột đã tồn tại chưa
  const tableDefinition = await queryInterface.describeTable(table);
  if (!tableDefinition[column]) {
    await queryInterface.addColumn(table, column, {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const table = "employers";
  const column = "referral_code";

  try {
    await queryInterface.removeColumn(table, column);
    console.log(`Removed column: ${column}`);
  } catch (error) {
    console.log(`Column ${column} does not exist or already removed`);
  }
}
