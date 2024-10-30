"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("categories", [
      {
        categoryName: "cactus",
      },
      {
        categoryName: "succulent",
      },
      {
        categoryName: "plants",
      },
      {
        categoryName: "pots",
      },
      {
        categoryName: "tools",
      },
      {
        categoryName: "growing_media",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     */
    await queryInterface.bulkDelete("categories", null, {});
  },
};
