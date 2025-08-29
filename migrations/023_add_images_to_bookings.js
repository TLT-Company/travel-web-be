export async function up(queryInterface, Sequelize) {
  // Add front_image column if it doesn't exist
  try {
    await queryInterface.addColumn("bookings", "front_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("Added column: front_image");
  } catch (error) {
    console.log("Column front_image already exists or failed to add");
  }

  // Add back_image column if it doesn't exist
  try {
    await queryInterface.addColumn("bookings", "back_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("Added column: back_image");
  } catch (error) {
    console.log("Column back_image already exists or failed to add");
  }

  // Add picture_avatar column if it doesn't exist
  try {
    await queryInterface.addColumn("bookings", "picture_avatar", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("Added column: picture_avatar");
  } catch (error) {
    console.log("Column picture_avatar already exists or failed to add");
  }
}

export async function down(queryInterface, Sequelize) {
  // Remove front_image column if it exists
  try {
    await queryInterface.removeColumn("bookings", "front_image");
    console.log("Removed column: front_image");
  } catch (error) {
    console.log("Column front_image does not exist or already removed");
  }

  // Remove back_image column if it exists
  try {
    await queryInterface.removeColumn("bookings", "back_image");
    console.log("Removed column: back_image");
  } catch (error) {
    console.log("Column back_image does not exist or already removed");
  }

  // Remove picture_avatar column if it exists
  try {
    await queryInterface.removeColumn("bookings", "picture_avatar");
    console.log("Removed column: picture_avatar");
  } catch (error) {
    console.log("Column picture_avatar does not exist or already removed");
  }
}
