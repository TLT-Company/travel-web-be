export async function up(queryInterface, Sequelize) {
  const table = 'employers';
  const column = 'referral_code';

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
  const table = 'employers';
  const column = 'referral_code';

  const tableDefinition = await queryInterface.describeTable(table);
  if (tableDefinition[column]) {
    await queryInterface.removeColumn(table, column);
  }
}
