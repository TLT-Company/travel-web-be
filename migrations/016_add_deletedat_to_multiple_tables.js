export async function up(queryInterface, Sequelize) {
  const tables = [
    "users",
    "customers",
    "admins",
    "employers",
    "tours",
    "bookings",
    "document_export_histories",
    "tasks",
    "task_assignments",
    "document",
    "document_customer",
    "permissions",
    "admin_permissions",
    // "reviews",
  ];

  for (const table of tables) {
    const tableDefinition = await queryInterface.describeTable(table);
    if (!tableDefinition.deleted_at) {
      await queryInterface.addColumn(table, "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  }
}

export async function down(queryInterface, Sequelize) {
  const tables = [
    "users",
    "customers",
    "admins",
    "employers",
    "tours",
    "bookings",
    "document_export_histories",
    "tasks",
    "task_assignments",
    "document",
    "document_customer",
    "permissions",
    "admin_permissions",
    // "reviews",
  ];

  for (const table of tables) {
    try {
      await queryInterface.removeColumn(table, "deleted_at");
      console.log(`Removed column deleted_at from table: ${table}`);
    } catch (error) {
      console.log(
        `Column deleted_at does not exist in table ${table} or already removed`
      );
    }
  }
}
