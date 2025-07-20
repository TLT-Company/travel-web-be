export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("bookings");

  if (!table.referral_code) {
    await queryInterface.addColumn("bookings", "referral_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }

  if (!table.front_image) {
    await queryInterface.addColumn("bookings", "front_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }

  if (!table.back_image) {
    await queryInterface.addColumn("bookings", "back_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}