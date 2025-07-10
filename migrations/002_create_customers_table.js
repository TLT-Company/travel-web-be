export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("customers", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    card_id: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Số CCCD",
    },
    card_created_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Ngày cấp CCCD",
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    day_of_birth: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Ngày sinh",
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Nam | Nữ | Khác",
    },
    national: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "Quốc tịch",
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    village: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Thôn/Xóm",
    },
    province: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Tỉnh/Thành phố",
    },
    district: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Quận/Huyện",
    },
    commune: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Xã/Phường",
    },
    place_of_birth: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Nơi sinh",
    },
    province_code: {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: "Mã tỉnh",
    },
    district_code: {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: "Mã huyện",
    },
    commune_code: {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: "Mã xã",
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    id_card_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    id_card_front: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Path ảnh CCCD mặt trước",
    },
    id_card_back: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Path ảnh CCCD mặt sau",
    },
    picture: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Path ảnh chân dung",
    },
    verified_status: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "pending | verified | rejected",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("customers");
}
