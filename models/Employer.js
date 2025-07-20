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
