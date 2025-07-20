import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("admin_permissions", {
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "admins",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "permissions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    granted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  await sequelize.query(`
    COMMENT ON TABLE admin_permissions IS 'Bảng trung gian: gán quyền cho admin';
  `);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("admin_permissions");
};
