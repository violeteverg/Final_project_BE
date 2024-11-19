const responseStatusMsg = require("../helper/responseMessage");
const { Cart, Product } = require("../models");

const createCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.body.userId;
    console.log(req.body, "ini quantity");

    if (!productId || !quantity) {
      return responseStatusMsg(
        res,
        404,
        "Product ID and quantity are required"
      );
    }
    const product = await Product.findByPk(productId, {
      attributes: ["quantity"],
    });
    if (!product) {
      return responseStatusMsg(res, 404, "Product not found");
    }

    if (quantity > product.quantity) {
      return responseStatusMsg(
        res,
        404,
        `Requested quantity exceeds available stock. Available stock: ${product.quantity}`
      );
    }
    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > product.quantity) {
        return responseStatusMsg(
          res,
          404,
          `Adding this quantity exceeds available stock. Available stock: ${product.quantity}`
        );
      }

      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();
      return responseStatusMsg(
        res,
        200,
        "Quantity updated in cart",
        "success_data",
        existingCartItem
      );
    } else {
      const newCartItem = await Cart.create({ userId, productId, quantity });
      return responseStatusMsg(
        res,
        200,
        "Item added to cart",
        "success_data",
        newCartItem
      );
    }
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Failed to create cart item",
      "error",
      null,
      error
    );
  }
};

const findAllCart = async (req, res) => {
  try {
    const userId = req.body.userId;
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["title", "price", "description", "image"],
        },
      ],
    });
    return responseStatusMsg(
      res,
      200,
      "Cart items retrieved successfully",
      "success_data",
      cartItems
    );
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Failed to retrieve cart items",
      "error",
      null,
      error
    );
  }
};

const countCart = async (req, res) => {
  try {
    const userId = req.body.userId;
    const cartItems = await Cart.findAll({
      where: { userId },
      attributes: ["quantity"],
      include: [
        {
          model: Product,
          attributes: ["quantity"],
        },
      ],
    });
    const totalQuantity = cartItems.reduce((sum, item) => {
      return sum + (item.quantity || 0);
    }, 0);
    res.status(200).json({ totalQuantity });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve cart items" });
  }
};
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    console.log(id, "ini params");
    console.log(req.body, "ini quantity");

    const userId = req.body.userId;
    const cart = await Cart.findOne({ where: { id, userId } });

    if (!cart) {
      return responseStatusMsg(res, 404, "Cart item not found");
    }
    if (quantity && cart.quantity !== quantity) {
      const product = await Product.findOne({ where: { id: cart.productId } });

      if (!product) {
        return responseStatusMsg(res, 404, "Product not found");
      }

      if (product.quantity < quantity) {
        return responseStatusMsg(
          res,
          404,
          `Product with ID ${cart.productId} does not have enough stock`
        );
      }
    }
    await cart.update({ quantity });

    return responseStatusMsg(
      res,
      200,
      "Cart item updated successfully",
      "success_data",
      cart
    );
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Failed to update cart item",
      "error",
      null,
      error
    );
  }
};
const removeCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const cartItem = await Cart.findOne({ where: { id, userId } });

    if (!cartItem) {
      return responseStatusMsg(res, 404, "Cart item not found");
    }
    await cartItem.destroy();

    return responseStatusMsg(res, 200, "Cart item removed successfully");
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Failed to remove cart item",
      "error",
      null,
      error
    );
  }
};
module.exports = {
  createCart,
  findAllCart,
  countCart,
  updateCart,
  removeCart,
};
