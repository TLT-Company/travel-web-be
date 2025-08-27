import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DocumentCustomer = sequelize.define(
  "DocumentCustomer",
  {
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "Liên kết tới công văn",
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "Liên kết tới khách hàng",
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "file ảnh tải lên",
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "document_customer",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at", 
    comment: "Bảng liên kết giữa công văn và khách hàng",
  }
);

export default DocumentCustomer;
