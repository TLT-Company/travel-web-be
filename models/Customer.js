import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    card_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Số CCCD",
    },
    card_created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Ngày cấp CCCD",
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    day_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Ngày sinh",
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["Nam", "Nữ", "Khác"]],
      },
      comment: "Nam | Nữ | Khác",
    },
    national: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Quốc tịch",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    village: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Thôn/Xóm",
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố",
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Quận/Huyện",
    },
    commune: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Xã/Phường",
    },
    place_of_birth: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nơi sinh",
    },
    province_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Mã tỉnh",
    },
    district_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Mã huyện",
    },
    commune_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Mã xã",
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_card_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_card_front: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Path ảnh CCCD mặt trước",
    },
    id_card_back: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Path ảnh CCCD mặt sau",
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Path ảnh chân dung",
    },
    verified_status: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["pending", "verified", "rejected"]],
      },
      comment: "pending | verified | rejected",
    },
  },
  {
    tableName: "customers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Customer;
