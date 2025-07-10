export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("tours", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "admins",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  // Add comment to table
  await queryInterface.sequelize.query(`
    COMMENT ON TABLE tours IS 'Tour được tạo bởi admin';
  `);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("tours");
}
