const mysql2 = require("mysql2");
module.exports = {
  development: {
    username: "root",
    password: null,
    database: "plant_ecommerce",
    host: "localhost",
    dialect: "mysql",
    dialectModule: mysql2,
  },
  test: {
    username: "root",
    password: null,
    database: "plant_ecommerce",
    host: "localhost",
    dialect: "mysql",
    dialectModule: mysql2,
  },
  production: {
    username: "root",
    password: null,
    database: "plant_ecommerce",
    host: "localhost",
    dialect: "mysql",
    dialectModule: mysql2,
  },
};
