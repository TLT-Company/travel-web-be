export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("bookings", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    customer_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    tour_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "tours",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    booking_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "pending | confirmed | cancelled",
    },
    assigned_to: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "admins",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("bookings");
}
