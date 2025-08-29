export async function up(queryInterface, Sequelize) {
  // 1. Tạo bảng address_mappings
  await queryInterface.createTable("address_mappings", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    province_old: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố (cũ)",
    },
    district_old: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Quận/Huyện (cũ)",
    },
    commune_old: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Xã/Phường (cũ)",
    },
    province_new: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố (mới)",
    },
    commune_new: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Xã/Phường (mới)",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  // 2. Xóa các cột cũ trong bảng customers (nếu tồn tại)
  try {
    await queryInterface.removeColumn("customers", "province");
    console.log("Removed column: province");
  } catch (error) {
    console.log("Column province does not exist or already removed");
  }

  try {
    await queryInterface.removeColumn("customers", "district");
    console.log("Removed column: district");
  } catch (error) {
    console.log("Column district does not exist or already removed");
  }

  try {
    await queryInterface.removeColumn("customers", "commune");
    console.log("Removed column: commune");
  } catch (error) {
    console.log("Column commune does not exist or already removed");
  }

  // 3. Thêm cột address_mapping_id vào bảng customers
  try {
    await queryInterface.addColumn("customers", "address_mapping_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "address_mappings",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    console.log("Added column: address_mapping_id");
  } catch (error) {
    console.log("Column address_mapping_id already exists or failed to add");
  }
}

export async function down(queryInterface, Sequelize) {
  // 1. Xóa cột address_mapping_id trong bảng customers
  try {
    await queryInterface.removeColumn("customers", "address_mapping_id");
  } catch (error) {
    console.log("Column address_mapping_id does not exist or already removed");
  }

  // 2. Thêm lại các cột cũ vào bảng customers
  try {
    await queryInterface.addColumn("customers", "province", {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố",
    });
  } catch (error) {
    console.log("Column province already exists or failed to add");
  }

  try {
    await queryInterface.addColumn("customers", "district", {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Quận/Huyện",
    });
  } catch (error) {
    console.log("Column district already exists or failed to add");
  }

  try {
    await queryInterface.addColumn("customers", "commune", {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Xã/Phường",
    });
  } catch (error) {
    console.log("Column commune already exists or failed to add");
  }

  // 3. Xóa bảng address_mappings
  try {
    await queryInterface.dropTable("address_mappings");
  } catch (error) {
    console.log("Table address_mappings does not exist or already dropped");
  }
}
