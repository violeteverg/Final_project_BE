"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "reviews",
      [
        {
          productId: 1,
          userId: 10,
          rating: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          productId: 1,
          userId: 16,
          comment: "Produk cukup memuaskan, tapi ada sedikit kekurangan.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          productId: 2,
          userId: 10,
          rating: 3.5,
          comment: "Produk biasa saja, sesuai dengan harga.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          productId: 2,
          userId: 16,
          rating: 4,
          comment: "Produk berkualitas baik, pengiriman cepat.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("reviews", null, {});
  },
};
