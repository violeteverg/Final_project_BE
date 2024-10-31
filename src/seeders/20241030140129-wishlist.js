"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "wishlists",
      [
        {
          userId: 10,
          productId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 10,
          productId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 16,
          productId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 16,
          productId: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("wishlists", null, {});
  },
};
