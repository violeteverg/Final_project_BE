const {
  createTransaction,
  verifyTransaction,
  cancelTransaction,
} = require("../services/midtransService");
const generateRandomString = require("../utils/generateRandomString");
const { Order, OrderItem, Product, User } = require("../models");
const verifySignatureKey = require("../utils/verifySignatureKey");
const updateOrderStatus = require("../services/updateOrder");
const { Op } = require("sequelize");
const responseStatusMsg = require("../helper/responseMessage");
const paginate = require("../utils/pagination");

const isProduction =
  process.env.NODE_ENV === "production"
    ? "https://leafy-nest-user.vercel.app/my-orders"
    : "http://localhost:5173/my-orders";
const createOrder = async (req, res) => {
  try {
    const { totalAmount, orderItems, addressName, isBuyNow } = req.body;

    console.log(orderItems, "ini order items");
    const userId = req.body.userId;
    const randomChar1 = generateRandomString(5);
    const randomChar2 = generateRandomString(5);
    const order_id = `TpLnts-${randomChar1}-${randomChar2}`;

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: totalAmount,
      },
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: isProduction,
        unfinish: isProduction,
        error: isProduction,
        cancel: isProduction,
      },
    };
    const transactionDetails = await createTransaction(parameter);
    console.log(transactionDetails, "ini transaction detail");

    await Order.destroy({
      where: {
        userId,
        vaNumber: {
          [Op.eq]: null,
        },
      },
    });

    const order = await Order.create({
      userId,
      addressName: addressName,
      orderDate: new Date(),
      orderId: order_id,
      orderStatus: "pending",
      paymentId: transactionDetails?.token,
      paymentStatus: "pending",
      totalAmount,
      vaNumber: null,
    });
    await OrderItem.create({
      orderId: order?.id,
      isBuyNow: isBuyNow,
      orderProduct: orderItems,
    });
    return responseStatusMsg(
      res,
      201,
      "success create order",
      "success_data",
      transactionDetails
    );
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Failed to create order",
      "error",
      null,
      error
    );
  }
};

const paymentCallback = async (req, res) => {
  try {
    const {
      order_id,
      transaction_status,
      gross_amount,
      va_numbers,
      signature_key,
      status_code,
    } = req.body;

    const isVerified = verifySignatureKey(
      signature_key,
      order_id,
      status_code,
      gross_amount
    );
    console.log(transaction_status, "ini status");

    if (!isVerified) {
      return res.status(403).json({ message: "Invalid signature key" });
    }
    const result = await updateOrderStatus(
      order_id,
      transaction_status,
      va_numbers
    );

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.log("Error updating payment status", error);
    res.status(500).json({ message: "Failed to process payment callback" });
  }
};

// const verifyStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const verify = await verifyTransaction(orderId);
//     return res.status(201).json({ message: "success", result: verify });
//   } catch (error) {
//     return res.status(500).json({});
//   }
// };
const getAllOrder = async (req, res) => {
  try {
    const userId = req.body.userId;
    const order = await Order.findAll({
      where: {
        userId: userId,
        vaNumber: {
          [Op.ne]: null,
        },
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: OrderItem,
          attributes: ["orderProduct", "isBuyNow"],
        },
      ],
    });

    return res.status(200).json({ message: "success", data: order });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "error get all order" });
  }
};

const getAllOrderAdmin = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const whereCondition = {
      ...(search && {
        [Op.or]: [{ orderId: { [Op.like]: `%${search}%` } }],
      }),
    };
    const order = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          attributes: ["orderProduct"],
        },
        {
          model: User,
          attributes: ["fullName"],
        },
      ],
    });

    const { data, pagination } = paginate(order, +page, +limit);

    return responseStatusMsg(
      res,
      200,
      "Products retrieved successfully",
      "success_data",
      { data, pagination }
    );
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "error get all order",
      "error",
      null,
      error
    );
  }
};

const getProductByOrderDetailId = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id },
      attributes: [
        "id",
        "userId",
        "orderId",
        "orderDate",
        "orderStatus",
        "paymentId",
      ],
      include: [
        {
          model: OrderItem,
          attributes: ["orderProduct"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderProductQuantity = order.OrderItem.orderProduct.reduce(
      (acc, item) => {
        acc[item.productId] = item.quantity;
        return acc;
      },
      {}
    );

    const products = await Product.findAll({
      where: { id: Object.keys(orderProductQuantity) },
      attributes: [
        "id",
        "categoryId",
        "discountId",
        "image",
        "title",
        "description",
        "price",
        "quantity",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });

    products.forEach((product) => {
      product.quantity = orderProductQuantity[product.id] || product.quantity;
    });

    const responseData = {
      ...order.toJSON(),
      products,
    };
    delete responseData.OrderItem;
    return res.status(200).json({ message: "success", data: responseData });
  } catch (error) {
    console.error("Error in getProductByOrderDetailId:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(orderId, "ini order id");
    await cancelTransaction(orderId);
    await Order.update(
      { orderStatus: "cancelled", paymentStatus: "cancelled" },
      { where: { orderId } }
    );
    return res.status(200).json({ message: "successfully cancel" });
  } catch (error) {
    console.error(error, "ini errornya");
    return res.status(500).json({ message: "error", error: error });
  }
};

module.exports = {
  createOrder,
  paymentCallback,
  getAllOrder,
  getAllOrderAdmin,
  getProductByOrderDetailId,
  cancelOrder,
};
