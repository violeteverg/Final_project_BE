"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.hasOne(models.OrderItem, { foreignKey: "orderId" });
    }
  }
  Order.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      addressName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      orderStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
    }
  );
  return Order;
};
