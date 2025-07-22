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
  }, {
    // ✅ Khai báo composite primary key trực tiếp ở đây
    primaryKeys: {
      document_customer_pkey: {
        fields: ["document_id", "customer_id"],
      },
    },
  });

  // ✅ Hoặc nếu cách trên không hoạt động, dùng `uniqueKeys` để đảm bảo tính duy nhất (nếu bạn chỉ muốn là khóa duy nhất chứ không phải PK)
  // uniqueKeys: {
  //   document_customer_unique: {
  //     fields: ['document_id', 'customer_id']
  //   }
  // }

  await sequelize.query(`
    COMMENT ON TABLE document_customer IS 'Bảng liên kết giữa công văn và khách hàng';
  `);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("document_customer");
};
