const { Cart, Product } = require("../models");

const createCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.body.userId;
    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json({
        message: "Quantity updated in cart",
        cartItem: existingCartItem,
      });
    } else {
      const newCartItem = await Cart.create({ userId, productId, quantity });
      return res
        .status(201)
        .json({ message: "Item add to cart", cartItem: newCartItem });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to create cart item" });
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
          attributes: ["title", "price", "description"],
        },
      ],
    });

    if (!cartItems.length) {
      return res.status(404).json({ message: "No items found in cart" });
    }

    res
      .status(200)
      .json({ message: "Cart items retrieved successfully", cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve cart items" });
  }
};
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.body.userId;
    const cart = await Cart.findOne({ where: { id, userId } });

    if (!cart) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (quantity && cart.quantity !== quantity) {
      const product = await Product.findOne({ where: { id: cart.productId } });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          message: `Product with ID ${cart.productId} does not have enough stock`,
        });
      }
    }
    await cart.update({ quantity });

    return res
      .status(200)
      .json({ message: "Cart item updated successfully", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};
const removeCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const cartItem = await Cart.findOne({ where: { id, userId } });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    await cartItem.destroy();

    return res.status(200).json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove cart item" });
  }
};
module.exports = {
  createCart,
  findAllCart,
  updateCart,
  removeCart,
};
