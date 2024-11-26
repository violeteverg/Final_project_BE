const axios = require("axios");

const {
  createTransaction,
  verifyTransaction,
  cancelTransaction,
} = require("../src/services/midtransService");
require("dotenv").config();

jest.mock("axios", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));
console.log = jest.fn();

describe("services/midtrans", () => {
  describe("createTransaction", () => {
    const transactionDetails = { order_id: "order-123", gross_amount: 100000 };

    it("should return transaction data when API call is successful", async () => {
      const mockResponse = {
        data: {
          token: "dummy-token",
          redirect_url: "https://midtrans.com/redirect",
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await createTransaction(transactionDetails);

      expect(axios.post).toHaveBeenCalledWith(
        "https://app.sandbox.midtrans.com/snap/v1/transactions",
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
      expect(result).toEqual(mockResponse.data);
    });
  });
  describe("verifyTransaction", () => {
    const orderId = "order-123";

    it("should return transaction status when API call is successful", async () => {
      const mockResponse = {
        data: {
          status_code: "200",
          status_message: "Transaction found",
          transaction_status: "settlement",
          order_id: orderId,
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await verifyTransaction(orderId);

      expect(axios.get).toHaveBeenCalledWith(
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
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("cancelTransaction", () => {
    const orderId = "order-123";

    it("should return success data when transaction is successfully canceled", async () => {
      const mockResponse = {
        data: {
          status_code: "200",
          status_message: "Transaction is canceled",
          order_id: orderId,
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await cancelTransaction(orderId);

      expect(axios.get).toHaveBeenCalledWith(
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
      expect(result).toEqual(mockResponse.data);
    });
  });
});
