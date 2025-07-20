import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Tour = sequelize.define(
  "Tour",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_5: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_6: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_7: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_8: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_9: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url_10: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    tableName: "tours",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    paranoid: true,
    comment: "Tour được tạo bởi admin",
  }
);

export default Tour;
