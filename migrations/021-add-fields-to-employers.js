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
  const columns = [
    "phone_number",
    "picture",
    "day_of_birth",
    "gender",
    "address",
  ];

  for (const column of columns) {
    try {
      await queryInterface.removeColumn("employers", column);
      console.log(`Removed column: ${column}`);
    } catch (error) {
      console.log(`Column ${column} does not exist or already removed`);
    }
  }
}
