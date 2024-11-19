const { Router } = require("express");
const getUserId = require("../middlewares/auth");
const {
  createOrder,
  paymentCallback,
  getProductByOrderDetailId,
  cancelOrder,
  // verifyStatus,
  getAllOrder,
} = require("../controllers/order");

const orderRouter = Router();

orderRouter.post("/transactions", getUserId, createOrder);
orderRouter.post("/notification", paymentCallback);
// orderRouter.post("/verify/:orderId", verifyStatus);
orderRouter.get("/findAll", getUserId, getAllOrder);
orderRouter.get("/findId/:id", getUserId, getProductByOrderDetailId);
orderRouter.post("/cancel", cancelOrder);

module.exports = orderRouter;
