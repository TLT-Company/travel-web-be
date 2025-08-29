export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("migrations", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    filename: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    executed_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
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

  // Add comment to table
  await queryInterface.sequelize.query(`
    COMMENT ON TABLE migrations IS 'Bảng theo dõi các file migration đã thực thi';
  `);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("migrations");
}
