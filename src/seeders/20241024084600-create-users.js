"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        fullName: "muh fauzan",
        userName: "fauzan",
        avatar: null,
        active: true,
        isAdmin: true,
        email: "milyasa2468@gmail.com",
        password: bcrypt.hashSync("1234567890", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
