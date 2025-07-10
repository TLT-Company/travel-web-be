import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("document_customer", {
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "document",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      comment: "Liên kết tới công văn",
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      comment: "Liên kết tới khách hàng",
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

  // Add composite primary key (this also serves as unique constraint)
  await sequelize.getQueryInterface().addConstraint("document_customer", {
    fields: ["document_id", "customer_id"],
    type: "primary key",
    name: "document_customer_pkey",
  });

  // Add comment to table
  await sequelize.query(`
    COMMENT ON TABLE document_customer IS 'Bảng liên kết giữa công văn và khách hàng';
  `);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("document_customer");
};
