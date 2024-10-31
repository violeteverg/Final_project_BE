const { Router } = require("express");
const userRouter = require("./user");
const productRouter = require("./product");
const cartRouter = require("./cart");
const wishlistRouter = require("./wishlist");
const reviewRouter = require("./review");

const routes = Router();

routes.use("/auth", userRouter);
routes.use("/product", productRouter);
routes.use("/cart", cartRouter);
routes.use("/wishlist", wishlistRouter);
routes.use("/review", reviewRouter);

module.exports = {
  routes,
};
