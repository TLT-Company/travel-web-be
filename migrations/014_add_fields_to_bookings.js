export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("bookings");

  if (!table.referral_code) {
    await queryInterface.addColumn("bookings", "referral_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.removeColumn("bookings", "referral_code");
    console.log("Removed column: referral_code");
  } catch (error) {
    console.log("Column referral_code does not exist or already removed");
  }
}
