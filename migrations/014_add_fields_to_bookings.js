export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("bookings");

  if (!table.referral_code) {
    await queryInterface.addColumn("bookings", "referral_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}