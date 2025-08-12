import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AddressMapping = sequelize.define(
  "AddressMapping",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    province_old: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố (cũ)",
    },
    district_old: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Quận/Huyện (cũ)",
    },
    commune_old: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Xã/Phường (cũ)",
    },
    province_new: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố (mới)",
    },
    commune_new: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Xã/Phường (mới)",
    },
  },
  {
    tableName: "address_mappings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AddressMapping;
