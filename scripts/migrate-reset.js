import { sequelize } from "../config/database.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Migration } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resetAndMigrate() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Drop all tables in reverse order to avoid foreign key constraints
    const tablesToDrop = [
      "admin_permissions",
      "permissions",
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
      "admins",
      "migrations", // Also drop migrations table
    ];

    console.log("🗑️ Dropping existing tables...");
    for (const table of tablesToDrop) {
      try {
        await sequelize.getQueryInterface().dropTable(table, { force: true });
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`ℹ️ Table ${table} doesn't exist or already dropped`);
      }
    }

    // Sync models to recreate all tables including migrations table
    console.log("🔄 Syncing models to recreate tables...");
    await sequelize.sync({ alter: true });
    console.log("✅ All tables recreated successfully.");

    // Get all migration files
    const migrationsDir = join(__dirname, "..", "migrations");
    const files = await readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith(".js")).sort(); // This will sort them in the correct order (001_, 002_, etc.)

    console.log(`📁 Found ${migrationFiles.length} migration files.`);

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`🔄 Running migration: ${file}`);
      const migration = await import(join(migrationsDir, file));

      try {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);

        // Record successful migration in migrations table
        await Migration.create({
          filename: file,
          executed_at: new Date(),
        });

        console.log(`✅ Migration ${file} completed successfully.`);
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error.message);

        // Provide more detailed error information
        if (error.sql) {
          console.error("SQL Error Details:");
          console.error(`  Code: ${error.parent?.code || "N/A"}`);
          console.error(`  Detail: ${error.parent?.detail || "N/A"}`);
          console.error(`  Hint: ${error.parent?.hint || "N/A"}`);
        }

        // Ask user if they want to continue or stop
        console.error(
          "\n💡 Tip: Check the migration file for issues or run 'npm run migrate:status' to see current status."
        );
        throw error;
      }
    }

    // Verify all migrations are recorded
    const recordedMigrations = await Migration.findAll({
      attributes: ["filename", "executed_at"],
      order: [["executed_at", "ASC"]],
    });

    console.log("\n📊 Migration Records Summary:");
    console.log("=".repeat(50));
    console.log(`Total migrations executed: ${recordedMigrations.length}`);
    recordedMigrations.forEach((migration) => {
      const executedAt = new Date(migration.executed_at).toLocaleString(
        "vi-VN"
      );
      console.log(`  • ${migration.filename} (${executedAt})`);
    });
    console.log("=".repeat(50));

    console.log("🎉 Database reset and all migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\n🔧 To troubleshoot:");
    console.error("  1. Check the specific migration file that failed");
    console.error("  2. Verify database connection and permissions");
    console.error("  3. Run 'npm run migrate:status' to see current status");
    console.error("  4. Consider running 'npm run migrate:setup' first");
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAndMigrate();
}

export { resetAndMigrate };
