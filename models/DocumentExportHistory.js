import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DocumentExportHistory = sequelize.define(
  "DocumentExportHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    kind: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Loại tài liệu export",
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Đường dẫn file",
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Tên file",
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Trạng thái (success, failed, etc.)",
      validate: {
        isIn: [["success", "failed", "processing", "pending"]],
      },
    },
    download_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Mã download duy nhất cho file export",
    },
  },
  {
    tableName: "document_export_histories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Lịch sử export tài liệu",
  }
);

export default DocumentExportHistory;
