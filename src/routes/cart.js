const { Router } = require("express");
const getUserId = require("../middlewares/auth");
const {
  createCart,
  findAllCart,
  updateCart,
  removeCart,
  countCart,
} = require("../controllers/cart");

const cartRouter = Router();
cartRouter.post("/create", getUserId, createCart);
cartRouter.get("/findAll", getUserId, findAllCart);
cartRouter.get("/count", getUserId, countCart);
cartRouter.post("/update/:id", getUserId, updateCart);
cartRouter.delete("/delete/:id", getUserId, removeCart);

module.exports = cartRouter;
