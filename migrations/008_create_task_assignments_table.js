export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("task_assignments", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    employer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "employers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    booking_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "bookings",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "new | in_progress | completed",
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("task_assignments");
}
