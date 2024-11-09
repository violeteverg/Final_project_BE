const { Router } = require("express");
const getUserId = require("../middlewares/auth");
const {
  createOrder,
  paymentCallback,
  getAllProduct,
  getProductByOrderDetailId,
} = require("../controllers/order");

const orderRouter = Router();

orderRouter.post("/transactions", getUserId, createOrder);
orderRouter.post("/notification", paymentCallback);
orderRouter.get("/findAll", getUserId, getAllProduct);
orderRouter.get("/findId/:id", getUserId, getProductByOrderDetailId);

module.exports = orderRouter;
