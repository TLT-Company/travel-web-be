import { sequelize } from "../config/database.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Migration } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models to ensure migrations table exists
    await sequelize.sync({ alter: true });
    console.log("Models synchronized successfully.");

    // Check if migrations table exists and has data
    let executedFilenames = [];
    try {
      const executedMigrations = await Migration.findAll({
        attributes: ["filename"],
      });
      executedFilenames = executedMigrations.map((m) => m.filename);
      console.log(
        `Found ${executedFilenames.length} already executed migrations.`
      );
    } catch (error) {
      console.log(
        "Migrations table is empty or doesn't exist. Starting fresh..."
      );
      executedFilenames = [];
    }

    // Get all migration files
    const migrationsDir = join(__dirname, "..", "migrations");
    const files = await readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith(".js")).sort();

    console.log(`Found ${migrationFiles.length} migration files.`);

    // Filter out already executed migrations
    const pendingMigrations = migrationFiles.filter(
      (file) => !executedFilenames.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log("🎉 All migrations are already up to date!");
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations.`);

    // Run each pending migration
    for (const file of pendingMigrations) {
      console.log(`Running migration: ${file}`);
      const migration = await import(join(migrationsDir, file));

      try {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);

        // Record successful migration
        await Migration.create({
          filename: file,
          executed_at: new Date(),
        });

        console.log(`✅ Migration ${file} completed successfully.`);
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error.message);
        throw error;
      }
    }

    console.log("🎉 All pending migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
