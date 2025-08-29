import { sequelize } from "../config/database.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Migration } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkMigrationStatus() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models to ensure migrations table exists
    await sequelize.sync({ alter: true });

    // Get all migration files
    const migrationsDir = join(__dirname, "..", "migrations");
    const files = await readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith(".js")).sort();

    // Get executed migrations from database
    let executedMigrations = [];
    try {
      executedMigrations = await Migration.findAll({
        attributes: ["filename", "executed_at"],
        order: [["executed_at", "ASC"]],
      });
    } catch (error) {
      console.log("Migrations table is empty or doesn't exist.");
      executedMigrations = [];
    }

    const executedFilenames = executedMigrations.map((m) => m.filename);

    console.log("\n📊 Migration Status Report");
    console.log("=".repeat(50));
    console.log(`Total migration files: ${migrationFiles.length}`);
    console.log(`Executed migrations: ${executedMigrations.length}`);
    console.log(
      `Pending migrations: ${migrationFiles.length - executedMigrations.length}`
    );

    if (executedMigrations.length > 0) {
      console.log("\n✅ Executed Migrations:");
      executedMigrations.forEach((migration) => {
        const executedAt = new Date(migration.executed_at).toLocaleString(
          "vi-VN"
        );
        console.log(`  • ${migration.filename} (${executedAt})`);
      });
    } else {
      console.log("\nℹ️ No migrations have been executed yet.");
    }

    const pendingMigrations = migrationFiles.filter(
      (file) => !executedFilenames.includes(file)
    );

    if (pendingMigrations.length > 0) {
      console.log("\n⏳ Pending Migrations:");
      pendingMigrations.forEach((file) => {
        console.log(`  • ${file}`);
      });
    } else {
      console.log("\n🎉 All migrations are up to date!");
    }

    console.log("\n" + "=".repeat(50));
  } catch (error) {
    console.error("Failed to check migration status:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run status check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkMigrationStatus();
}

export { checkMigrationStatus };
