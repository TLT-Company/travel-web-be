export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("employers", "referral_code", {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("employers", "referral_code");
}
