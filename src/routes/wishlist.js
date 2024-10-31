const { Router } = require("express");
const getUserId = require("../middlewares/auth");
const {
  createWishlist,
  findAllWishlist,
  removeWishlist,
} = require("../controllers/wishlist");

const wishlistRouter = Router();

wishlistRouter.post("/create", getUserId, createWishlist);
wishlistRouter.get("/findAll", getUserId, findAllWishlist);
wishlistRouter.delete("/delete/:id", getUserId, removeWishlist);

module.exports = wishlistRouter;
