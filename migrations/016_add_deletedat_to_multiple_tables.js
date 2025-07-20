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
    "reviews",
  ];

  for (const table of tables) {
    await queryInterface.addColumn(table, "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
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
    "reviews",
  ];

  for (const table of tables) {
    await queryInterface.removeColumn(table, "deleted_at");
  }
}
