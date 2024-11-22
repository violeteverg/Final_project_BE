const { Router } = require("express");
const getUserId = require("../middlewares/auth");
const {
  createOrder,
  paymentCallback,
  getProductByOrderDetailId,
  cancelOrder,
  getAllOrder,
  getAllOrderAdmin,
} = require("../controllers/order");

const orderRouter = Router();

orderRouter.post("/transactions", getUserId, createOrder);
orderRouter.post("/notification", paymentCallback);
orderRouter.get("/admin/findAll", getAllOrderAdmin);
orderRouter.get("/findAll", getUserId, getAllOrder);
orderRouter.get("/findId/:id", getUserId, getProductByOrderDetailId);
orderRouter.get("/admin/findId/:id", getProductByOrderDetailId);
orderRouter.post("/cancel", cancelOrder);

module.exports = orderRouter;
