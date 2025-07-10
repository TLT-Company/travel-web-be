import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("admins", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "super_admin | admin",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  // Add comment to table
  await sequelize.query(`
    COMMENT ON TABLE admins IS 'Tài khoản admin, phân biệt super_admin và admin';
  `);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("admins");
};
