const axios = require("axios");

const createTransaction = async (transactionDetails) => {
  try {
    console.log(process.env.MIDTRANS_URL, "url");
    console.log(process.env.MIDTRANS_SERVER_KEY, "server");
    const transaction = await axios.post(
      `https://app.sandbox.midtrans.com/snap/v1/transactions`,
      transactionDetails,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.MIDTRANS_SERVER_KEY}:`
          ).toString("base64")}`,
          Accept: "application/json",
          "content-type": "application/json",
        },
      }
    );
    console.log(transaction.data, "ini create Transaction");
    return transaction.data;
  } catch (error) {
    console.error(
      "Midtrans Error:",
      error.response ? error.response.data : error.message
    );
    throw new Error(error);
  }
};

const verifyTransaction = async (orderId) => {
  try {
    const verify = await axios.get(
      `${process.env.MIDTRANS_URL}/${orderId}/status`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.MIDTRANS_SERVER_KEY}:`
          ).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );
    return verify.data;
  } catch (error) {
    console.error(error, "ini error verify transaction");
  }
};

const cancelTransaction = async (orderId) => {
  try {
    const cancel = await axios.get(
      `${process.env.MIDTRANS_URL}/${orderId}/cancel`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.MIDTRANS_SERVER_KEY}:`
          ).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );
    return cancel.data;
  } catch (error) {
    console.error(error, "ini error cancel transaction");
  }
};

module.exports = { createTransaction, verifyTransaction, cancelTransaction };
