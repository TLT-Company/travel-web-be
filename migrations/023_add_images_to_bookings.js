export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("bookings", "front_image", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("bookings", "back_image", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("bookings", "picture_avatar", {
    type: Sequelize.STRING,
    allowNull: true,
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("bookings", "front_image");
  await queryInterface.removeColumn("bookings", "back_image");
  await queryInterface.removeColumn("bookings", "picture_avatar");
}