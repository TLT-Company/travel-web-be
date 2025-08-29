import { sequelize } from "../config/database.js";
import { Migration } from "../models/index.js";

async function setupMigrationsTable() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models to create migrations table
    await sequelize.sync({ alter: true });
    console.log("Migrations table created successfully.");

    // Check if migrations table is working
    const count = await Migration.count();
    console.log(`Migrations table is working. Current count: ${count}`);

    console.log("✅ Migrations table setup completed successfully!");
  } catch (error) {
    console.error("Failed to setup migrations table:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMigrationsTable();
}

export { setupMigrationsTable };
