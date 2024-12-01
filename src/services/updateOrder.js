const { Order, Product, OrderItem, Cart } = require("../models");

const getOrderStatus = (transactionStatus) => {
  switch (transactionStatus) {
    case "settlement":
      return { orderStatus: "completed", paymentStatus: "paid" };
    case "pending":
      return { orderStatus: "pending", paymentStatus: "pending" };
    case "expire":
      return { orderStatus: "expire", paymentStatus: "expire" };
    default:
      return { orderStatus: "none", paymentStatus: "none" };
  }
};

const updateProductQuantities = async (orderProducts) => {
  const quantityMap = {};

  for (const item of orderProducts) {
    const { productId, quantity } = item;
    quantityMap[productId] = (quantityMap[productId] || 0) + quantity;
  }

  for (const productId in quantityMap) {
    const product = await Product.findOne({ where: { id: productId } });
    if (product) {
      const newQuantity = Math.max(
        product.quantity - quantityMap[productId],
        0
      );
      await product.update({ quantity: newQuantity });
    }
  }
};

const checkingProductQuantity = async (orderId, orderProducts, res) => {
  for (const item of orderProducts) {
    const product = await Product.findOne({ where: { id: item.productId } });
    if (!product || product.quantity < item.quantity) {
      await Order.update(
        {
          orderStatus: "rejected",
          paymentStatus: "refund",
        },
        {
          where: { orderId },
        }
      );
      return {
        success: false,
        message: `${product?.title || "Product"} quantity is not in stock`,
      };
    }
  }
  return { success: true };
};

const removeProductsFromCart = async (userId, orderProducts) => {
  for (const item of orderProducts) {
    const { productId } = item;
    await Cart.destroy({
      where: {
        userId: userId,
        productId: productId,
      },
    });
  }
};

const updateOrderStatus = async (orderId, transactionStatus, vaNumbers) => {
  try {
    const order = await Order.findOne({
      where: { orderId },
      include: [
        {
          model: OrderItem,
          attributes: ["orderProduct", "isBuyNow"],
        },
      ],
    });

    if (!order) return { success: false, message: "Order not found" };

    const { orderStatus, paymentStatus } = getOrderStatus(transactionStatus);

    await order.update({
      orderStatus,
      paymentStatus,
      vaNumber: vaNumbers,
    });

    const checkResult = await checkingProductQuantity(
      orderId,
      order.OrderItem.orderProduct
    );

    if (!checkResult.success) return checkResult;

    if (orderStatus === "completed" && order.OrderItem.isBuyNow === false) {
      await removeProductsFromCart(order.userId, order.OrderItem.orderProduct);
    }

    if (orderStatus === "completed") {
      await updateProductQuantities(order.OrderItem.orderProduct);
    }

    return {
      success: true,
      message: "Order and product quantity updated successfully",
    };
  } catch (error) {
    console.error("Error updating order status and product quantity:", error);
    return {
      success: false,
      message: "Failed to update order status and product quantity",
    };
  }
};
module.exports = { updateOrderStatus, getOrderStatus };
