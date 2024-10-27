const { Router } = require("express");
const userRouter = require("./user");

const routes = Router();

routes.use("/auth", userRouter);

module.exports = {
  routes,
};
