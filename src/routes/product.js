const { Router } = require("express");
const upload = require("../utils/multerConfig");
const {
  createProduct,
  findAllProduct,
  findProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const productRouter = Router();

productRouter.post("/create", upload.single("image"), createProduct);
productRouter.get("/findAll", findAllProduct);
productRouter.get("/findId/:id", findProductById);
productRouter.patch("/update/:id", upload.single("image"), updateProduct);
productRouter.patch("/delete/:id", deleteProduct);

module.exports = productRouter;
