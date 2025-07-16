import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TaskAssignment = sequelize.define(
  "TaskAssignment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    employer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["new", "in_progress", "completed"]],
      },
      comment: "new | in_progress | completed",
    },
  },
  {
    tableName: "task_assignments",
    timestamps: false,
  }
);

export default TaskAssignment;
