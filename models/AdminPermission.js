import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AdminPermission = sequelize.define(
  "AdminPermission",
  {
    admin_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "admins",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
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
  },
  {
    tableName: "admin_permissions",
    timestamps: false,
  }
);

export default AdminPermission;
