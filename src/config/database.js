const mysql2 = require("mysql2");
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "plant_ecommerce",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "plant_ecommerce",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectModule: mysql2,
  },
  production: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "plant_ecommerce",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
