import bcrypt from "bcryptjs";
import { sequelize } from "../config/database.js";
import Admin from "../models/Admin.js";
import Employer from "../models/Employer.js";

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({
      where: { role: "super_admin" },
    });

    if (existingSuperAdmin) {
      console.log("⚠️  Super admin already exists!");
      console.log(`Username: ${existingSuperAdmin.username}`);
      return;
    }

    // Super admin credentials
    const superAdminData = {
      username: "superadmin",
      password: "superadmin123",
      role: "super_admin",
      full_name: "Super Administrator",
      position: "System Administrator",
    };

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(superAdminData.password, salt);

    // Create super admin
    const superAdmin = await Admin.create({
      username: superAdminData.username,
      password_hash,
      role: superAdminData.role,
    });

    // Create employer profile for super admin
    const employer = await Employer.create({
      admin_id: superAdmin.id,
      full_name: superAdminData.full_name,
      position: superAdminData.position,
    });

    console.log("✅ Super admin created successfully!");
    console.log("📋 Super Admin Details:");
    console.log(`   Username: ${superAdminData.username}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log(`   Role: ${superAdminData.role}`);
    console.log(`   Full Name: ${superAdminData.full_name}`);
    console.log(`   Position: ${superAdminData.position}`);
    console.log("\n⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Database connection closed.");
  }
};

// Run the script
createSuperAdmin();
