import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("permissions", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "Tên quyền, ví dụ: manage_users",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Mô tả chức năng",
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
    COMMENT ON TABLE permissions IS 'Danh sách quyền hệ thống có thể gán cho admin';
  `);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("permissions");
};
