const {
  createTransaction,
  verifyTransaction,
} = require("../services/midtransService");
const generateRandomString = require("../utils/generateRandomString");
const { Order, OrderItem } = require("../models");
const verifySignatureKey = require("../utils/verifySignatureKey");
const updateOrderStatus = require("../services/updateOrder");

// create & read
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
        finish: "http://localhost:5173/all-product",
        unfinish: "https://plants-ecommerce.vercel.app/product",
        error: "https://plants-ecommerce.vercel.app/pots",
        cancel: "https://plants-ecommerce.vercel.app/succulents",
      },
    };
    const transactionDetails = await createTransaction(parameter);
    console.log(transactionDetails, "ini transations dtail");
    // const token = transactionDetails?.token?.substring(0, 50);
    // console.log(token);
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
    return res
      .status(201)
      .json({ message: "ini create success", result: transactionDetails });
  } catch (error) {
    console.log(error, "ini error");
    return res.status(500).json({ message: "ini gagal" });
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
    console.log(req.body, "ini req body");

    const isVerified = verifySignatureKey(
      signature_key,
      order_id,
      status_code,
      gross_amount
    );
    console.log(isVerified, "ini isverified");
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
const getAllProduct = async (req, res) => {
  try {
    const order = await Order.findAll({
      include: [
        {
          model: OrderItem,
          attributes: ["orderProduct", "isBuyNow"],
        },
      ],
    });
    // const orderItems = order.OrderItem.orderProduct;
    return res.status(200).json({ message: "success", data: order });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

module.exports = { createOrder, paymentCallback, getAllProduct };
