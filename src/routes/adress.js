const { Router } = require("express");
const getUserId = require("../middlewares/auth");
const {
  findAllAdress,
  createAdress,
  updateAddress,
  removeAddress,
} = require("../controllers/address");

const addressRouter = Router();

addressRouter.post("/create", getUserId, createAdress);
addressRouter.get("/findAll", getUserId, findAllAdress);
addressRouter.patch("/update/:id", getUserId, updateAddress);
addressRouter.delete("/delete/:id", getUserId, removeAddress);

module.exports = addressRouter;
