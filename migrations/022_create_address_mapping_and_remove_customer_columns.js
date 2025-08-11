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

  // 2. Xóa các cột cũ trong bảng customers
  await queryInterface.removeColumn("customers", "province");
  await queryInterface.removeColumn("customers", "district");
  await queryInterface.removeColumn("customers", "commune");

  // 3. Thêm cột address_mapping_id vào bảng customers
  await queryInterface.addColumn("customers", "address_mapping_id", {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "address_mappings",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    after: "verified_status",
  });
}

export async function down(queryInterface, Sequelize) {
  // 1. Xóa cột address_mapping_id trong bảng customers
  await queryInterface.removeColumn("customers", "address_mapping_id");

  // 2. Thêm lại các cột cũ vào bảng customers
  await queryInterface.addColumn("customers", "province", {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: "Tỉnh/Thành phố",
  });
  await queryInterface.addColumn("customers", "district", {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: "Quận/Huyện",
  });
  await queryInterface.addColumn("customers", "commune", {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: "Xã/Phường",
  });

  // 3. Xóa bảng address_mappings
  await queryInterface.dropTable("address_mappings");
}
