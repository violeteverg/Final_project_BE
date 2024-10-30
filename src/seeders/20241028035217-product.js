"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "products",
      [
        {
          categoryId: 1,
          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1724121328/product/lizvgl1blvapyt3bppxe.png",
          title: "Cactus",
          description: "This is a description product cactus",
          price: 10000,
          quantity: 50,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoryId: 2,

          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1724859600/product/m47u6xh1vrjtt5lfv7fz.png",
          title: "succulent",
          description: "This is a description for product succulent",
          price: 20000,
          quantity: 30,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoryId: 3,
          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1724120347/product/gcg0nlt3agirpxjwrtlg.png",
          title: "Plants",
          description: "This is a description for plants",
          price: 15000,
          quantity: 20,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoryId: 6,
          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1722685846/product/wwtg66zluh2zjqn9jj3y.png",
          title: "organic fertilizer",
          description: "This is a description for organic fertilizer",
          price: 12000,
          quantity: 25,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoryId: 3,
          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1724120545/product/mrinfg4xbnlrnlfssfnr.png",
          title: "Plants 2",
          description: "This is a description for Plants 2",
          price: 18000,
          quantity: 15,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", null, {});
  },
};
