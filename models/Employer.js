import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Employer = sequelize.define(
  "Employer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referral_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    day_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["Nam", "Nữ", "Khác"]],
      },
      comment: "Nam | Nữ | Khác",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "employers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

Employer.associate = (models) => {
  Employer.belongsTo(models.Admin, {
    foreignKey: "admin_id",
    as: "admin",
  });
};

export default Employer;
