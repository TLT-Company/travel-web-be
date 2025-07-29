export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("employers");

  if (!table.phone_number) {
    await queryInterface.addColumn("employers", "phone_number", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  }

  if (!table.picture) {
    await queryInterface.addColumn("employers", "picture", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }

  if (!table.day_of_birth) {
    await queryInterface.addColumn("employers", "day_of_birth", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }

  if (!table.gender) {
    await queryInterface.addColumn("employers", "gender", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Nam | Nữ | Khác",
    });
  }

  if (!table.address) {
    await queryInterface.addColumn("employers", "address", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("employers", "phone_number");
  await queryInterface.removeColumn("employers", "picture");
  await queryInterface.removeColumn("employers", "day_of_birth");
  await queryInterface.removeColumn("employers", "gender");
  await queryInterface.removeColumn("employers", "address");
}
