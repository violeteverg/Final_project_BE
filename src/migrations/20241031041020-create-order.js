"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      adressName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      orderStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders");
  },
};
