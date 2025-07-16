import { sequelize } from "../config/database.js";

async function cleanupDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Drop all tables in reverse order to avoid foreign key constraints
    const tablesToDrop = [
      "tasks",
      "task_assignments",
      "bookings",
      "tours",
      "employers",
      "customers",
      "users",
      "document_customer",
      "document_export_histories",
      "document",
      "document_customer",
      "admins",
      "permissions",
      "admin_permissions",
    ];

    console.log("🗑️ Dropping all tables...");
    for (const table of tablesToDrop) {
      try {
        await sequelize.getQueryInterface().dropTable(table, { force: true });
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`ℹ️ Table ${table} doesn't exist or already dropped`);
      }
    }

    console.log("🎉 Database cleanup completed successfully!");
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run cleanup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupDatabase();
}

export { cleanupDatabase };
