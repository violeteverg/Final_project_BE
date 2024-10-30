const { Router } = require("express");
const userRouter = require("./user");
const productRouter = require("./product");
const cartRouter = require("./cart");

const routes = Router();

routes.use("/auth", userRouter);
routes.use("/product", productRouter);
routes.use("/cart", cartRouter);

module.exports = {
  routes,
};
