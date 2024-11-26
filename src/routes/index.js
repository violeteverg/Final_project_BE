const { Router } = require("express");
const userRouter = require("./user");
const productRouter = require("./product");
const cartRouter = require("./cart");
const reviewRouter = require("./review");
const addressRouter = require("./adress");
const orderRouter = require("./order");

const routes = Router();

routes.use("/auth", userRouter);
routes.use("/product", productRouter);
routes.use("/cart", cartRouter);
routes.use("/review", reviewRouter);
routes.use("/address", addressRouter);
routes.use("/order", orderRouter);

module.exports = {
  routes,
};
