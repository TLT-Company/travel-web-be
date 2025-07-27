'use strict';

export async function up(queryInterface, Sequelize) {
  const table = 'bookings';
  const tableDefinition = await queryInterface.describeTable(table);

  // Nếu có cột customer_id thì mới rename
  if (tableDefinition.customer_id) {
    await queryInterface.renameColumn(table, 'customer_id', 'user_id');
  }
}

export async function down(queryInterface, Sequelize) {
  const table = 'bookings';
  const tableDefinition = await queryInterface.describeTable(table);

  // Rollback: nếu có user_id thì rename ngược lại
  if (tableDefinition.user_id) {
    await queryInterface.renameColumn(table, 'user_id', 'customer_id');
  }
}
