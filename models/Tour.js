import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const removeVietnameseTones = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
};

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
    slug_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slug_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "tours",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    paranoid: true,
    deletedAt: "deleted_at",
    comment: "Tour được tạo bởi admin",
  }
);

Tour.beforeCreate((tour) => {
  if (tour.name) {
    tour.slug_name = removeVietnameseTones(tour.name);
  }
  if (tour.location) {
    tour.slug_location = removeVietnameseTones(tour.location);
  }
});

Tour.beforeUpdate((tour) => {
  if (tour.name) {
    tour.slug_name = removeVietnameseTones(tour.name);
  }
  if (tour.location) {
    tour.slug_location = removeVietnameseTones(tour.location);
  }
});

export default Tour;
