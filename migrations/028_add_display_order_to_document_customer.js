import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const up = async () => {
  const tableDescription = await sequelize
    .getQueryInterface()
    .describeTable("document_customer");

  if (!tableDescription.display_order) {
    await sequelize
      .getQueryInterface()
      .addColumn("document_customer", "display_order", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "Thứ tự hiển thị của khách hàng trong công văn",
      });
  }
};

export const down = async () => {
  await sequelize
    .getQueryInterface()
    .removeColumn("document_customer", "display_order");
};
