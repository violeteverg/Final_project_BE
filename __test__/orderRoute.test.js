const request = require("supertest");
const {
  createTransaction,
  verifyTransaction,
  cancelTransaction,
} = require("../src/services/midtransService");
const verifySignatureKey = require("../src/utils/verifySignatureKey");
const { updateOrderStatus } = require("../src/services/updateOrder");

const { Order, OrderItem, Product, User } = require("../src/models");
const app = require("../index");
const jwt = require("jsonwebtoken");

jest.mock("../src/models", () => ({
  Order: {
    create: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  OrderItem: {
    create: jest.fn(),
  },
  Product: {
    findAll: jest.fn(),
  },
  User: {
    count: jest.fn(),
  },
}));
jest.mock("../src/utils/verifySignatureKey", () => jest.fn());

jest.mock("../src/services/updateOrder", () => ({
  updateOrderStatus: jest.fn(),
}));

jest.mock("../src/services/midtransService", () => ({
  createTransaction: jest.fn(),
  cancelTransaction: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
describe("Order /api/order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("POST /api/order", () => {
    it("should create an order successfully", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockOrderItems = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ];
      const mockTransactionDetails = {
        token: "mockPaymentToken",
      };

      createTransaction.mockResolvedValue(mockTransactionDetails);
      Order.create.mockResolvedValue({
        id: 1,
        userId: 1,
        addressName: "123 Main St",
        orderId: "TpLnts-abcde-fghij",
        orderDate: new Date(),
        orderStatus: "pending",
        paymentId: "mockPaymentToken",
        paymentStatus: "pending",
        totalAmount: 100,
        vaNumber: null,
      });
      OrderItem.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/order/transactions")
        .send({
          totalAmount: 100,
          orderItems: mockOrderItems,
          addressName: "123 Main St",
          isBuyNow: false,
          userId: 1,
        })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("success create order");
      expect(res.body.result.token).toBe(mockTransactionDetails.token);
      expect(Order.create).toHaveBeenCalledWith({
        userId: 1,
        addressName: "123 Main St",
        orderDate: expect.any(Date),
        orderId: expect.stringMatching(/^LPlants/),
        orderStatus: "pending",
        paymentId: mockTransactionDetails.token,
        paymentStatus: "pending",
        totalAmount: 100,
        vaNumber: null,
      });
      expect(OrderItem.create).toHaveBeenCalledWith({
        orderId: 1,
        isBuyNow: false,
        orderProduct: mockOrderItems,
      });
    });

    it("should return 500 if an internal server error occurs", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      createTransaction.mockRejectedValue(new Error("Transaction failed"));

      const res = await request(app)
        .post("/api/order/transactions")
        .send({
          totalAmount: 100,
          orderItems: [{ productId: 1, quantity: 2 }],
          addressName: "123 Main St",
          isBuyNow: false,
          userId: 1,
        })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to create order");
    });
  });
  describe("POST /api/order/notification", () => {
    it("should process payment callback successfully", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockOrderId = "TpLnts-abcde-fghij";
      const mockTransactionStatus = "success";
      const mockVaNumbers = "123456789";
      const mockSignatureKey = "valid_signature";
      const mockStatusCode = "200";
      const mockGrossAmount = 100;

      verifySignatureKey.mockReturnValue(true);

      updateOrderStatus.mockResolvedValue({
        success: true,
        message: "Order and product quantity updated successfully",
      });

      const res = await request(app)
        .post("/api/order/notification")
        .send({
          order_id: mockOrderId,
          transaction_status: mockTransactionStatus,
          gross_amount: mockGrossAmount,
          va_numbers: mockVaNumbers,
          signature_key: mockSignatureKey,
          status_code: mockStatusCode,
        })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Order and product quantity updated successfully"
      );
    });

    it("should return 403 if the signature key is invalid", async () => {
      const mockOrderId = "TpLnts-abcde-fghij";
      const mockTransactionStatus = "success";
      const mockVaNumbers = "123456789";
      const mockSignatureKey = "invalid_signature";
      const mockStatusCode = "200";
      const mockGrossAmount = 100;

      verifySignatureKey.mockReturnValue(false);

      const res = await request(app).post("/api/order/notification").send({
        order_id: mockOrderId,
        transaction_status: mockTransactionStatus,
        gross_amount: mockGrossAmount,
        va_numbers: mockVaNumbers,
        signature_key: mockSignatureKey,
        status_code: mockStatusCode,
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Invalid signature key");
    });

    it("should return 500 if an error occurs during payment processing", async () => {
      const mockOrderId = "TpLnts-abcde-fghij";
      const mockTransactionStatus = "success";
      const mockVaNumbers = "123456789";
      const mockSignatureKey = "valid_signature";
      const mockStatusCode = "200";
      const mockGrossAmount = 100;

      updateOrderStatus.mockRejectedValue(
        new Error("Error updating order status")
      );

      verifySignatureKey.mockReturnValue(true);

      const res = await request(app).post("/api/order/notification").send({
        order_id: mockOrderId,
        transaction_status: mockTransactionStatus,
        gross_amount: mockGrossAmount,
        va_numbers: mockVaNumbers,
        signature_key: mockSignatureKey,
        status_code: mockStatusCode,
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to process payment callback");
    });
  });
  describe("GET /api/order", () => {
    it("should return all orders for a user", async () => {
      jwt.verify.mockReturnValue({
        id: 18,
      });
      const mockOrders = [
        {
          id: 4,
          userId: 18,
          vaNumber: "12345",
          createdAt: "2024-11-23T12:53:29.000Z",
          updatedAt: "2024-11-23T12:53:40.000Z",
          OrderItem: {
            orderProduct: "succulent",
            isBuyNow: true,
          },
        },
      ];
      Order.findAll.mockResolvedValue(
        mockOrders.map((order) => ({
          ...order,
          get: () => order,
        }))
      );
      const response = await request(app)
        .get("/api/order/findAll")
        .send({ userId: 18 })
        .set("_usertkn", "Bearer token");

      const formattedOrders = [
        {
          id: 4,
          userId: 18,
          vaNumber: "12345",
          createdAt: "2024-11-23T12:53:29.000Z",
          updatedAt: "2024-11-23T12:53:40.000Z",
          orderProduct: "succulent",
          isBuyNow: true,
        },
      ];
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
      expect(response.body.data).toEqual(formattedOrders);
    });

    it("should handle errors when fetching orders", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Order.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/order/findAll")
        .set("_usertkn", "Bearer token");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("error get all order");
    });
    it("should return statistics successfully", async () => {
      Order.findAll.mockResolvedValue([
        { totalAmount: 100000 },
        { totalAmount: 150000 },
        { totalAmount: 200000 },
      ]);
      User.count.mockResolvedValue(15);

      const response = await request(app).get("/api/order/admin/stat");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 200,
        message: "Orders retrieved successfully",
        result: {
          user: 15,
          totalOrders: 3,
          totalRevenue: 450000,
        },
      });
    });
    it("should handle errors gracefully", async () => {
      Order.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/order/admin/stat");

      expect(response.status).toBe(500);
    });

    it("should return all order for admin", async () => {
      const mockOrders = [
        {
          id: 1,
          userId: 18,
          addressName: "jl.senang banget",
          orderId: "TpLnts-YTZx1-wm85U",
          orderDate: "2024-11-22T12:46:19.000Z",
          orderStatus: "completed",
          paymentId: "f2b28d92-9b29-4880-b1d3-ef32690fc8d3",
          paymentStatus: "paid",
          totalAmount: 120000,
          vaNumber: [
            {
              bank: "bca",
              va_number: "60991008001977877688922",
            },
          ],
          createdAt: "2024-11-22T12:46:19.000Z",
          updatedAt: "2024-11-22T12:46:28.000Z",
          OrderItem: {
            orderProduct: [
              {
                image:
                  "https://res.cloudinary.com/dd2h1xakd/image/upload/v1730268990/product/wlwnzragcp5ro29epudm.png",
                price: 120000,
                quantity: 1,
                productId: 7,
                productName: "cactus",
              },
            ],
          },
          User: {
            fullName: "udinx",
          },
        },
      ];

      const mockPagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
      };
      Order.findAll.mockResolvedValue(mockOrders);
      const res = await request(app)
        .get("/api/order/admin/findAll?")
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        code: 200,
        message: "Products retrieved successfully",
        result: {
          data: mockOrders,
          pagination: mockPagination,
        },
      });
    });
    it("should return all order for admin with query params", async () => {
      const mockOrders = [
        {
          id: 1,
          userId: 18,
          addressName: "jl.senang banget",
          orderId: "TpLnts-YTZx1-wm85U",
          orderDate: "2024-11-22T12:46:19.000Z",
          orderStatus: "completed",
          paymentId: "f2b28d92-9b29-4880-b1d3-ef32690fc8d3",
          paymentStatus: "paid",
          totalAmount: 120000,
          vaNumber: [
            {
              bank: "bca",
              va_number: "60991008001977877688922",
            },
          ],
          createdAt: "2024-11-22T12:46:19.000Z",
          updatedAt: "2024-11-22T12:46:28.000Z",
          OrderItem: {
            orderProduct: [
              {
                image:
                  "https://res.cloudinary.com/dd2h1xakd/image/upload/v1730268990/product/wlwnzragcp5ro29epudm.png",
                price: 120000,
                quantity: 1,
                productId: 7,
                productName: "cactus",
              },
            ],
          },
          User: {
            fullName: "udinx",
          },
        },
      ];

      const mockPagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
      };
      Order.findAll.mockResolvedValue(mockOrders);
      const res = await request(app).get(
        "/api/order/admin/findAll?search=TPLNT"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        code: 200,
        message: "Products retrieved successfully",
        result: {
          data: mockOrders,
          pagination: mockPagination,
        },
      });
    });
    it("should return 500 if an error occurs", async () => {
      Order.findAll.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .get("/api/order/admin/findAll")
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(500);
    });
  });
  describe("GET /api/orders/order/:id", () => {
    it("should return product details for a given order ID", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockOrder = {
        id: 35,
        userId: 18,
        orderId: "TpLnts-BoonX-0X2zG",
        orderDate: "2024-11-08T02:57:20.000Z",
        orderStatus: "completed",
        paymentId: "cd21ce9d-4226-4d62-8aee-ac90adb8ac66",
        OrderItem: {
          orderProduct: [
            {
              price: 10000,
              quantity: 2,
              productId: 1,
              productName: "Cactus",
            },
            {
              price: 12000,
              quantity: 2,
              productId: 4,
              productName: "organic fertilizer",
            },
          ],
        },
        toJSON: jest.fn().mockReturnValue({
          id: 35,
          userId: 18,
          orderId: "TpLnts-BoonX-0X2zG",
          orderDate: "2024-11-08T02:57:20.000Z",
          orderStatus: "completed",
          paymentId: "cd21ce9d-4226-4d62-8aee-ac90adb8ac66",
          OrderItem: {
            orderProduct: [
              {
                price: 10000,
                quantity: 2,
                productId: 1,
                productName: "Cactus",
              },
              {
                price: 12000,
                quantity: 2,
                productId: 4,
                productName: "organic fertilizer",
              },
            ],
          },
        }),
      };

      const mockProducts = [
        {
          id: 1,
          categoryId: 1,
          discountId: null,
          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1724121328/product/lizvgl1blvapyt3bppxe.png",
          title: "Cactus",
          description: "This is a description product cactus",
          price: 10000,
          quantity: 10,
          isActive: false,
          createdAt: "2024-10-30T06:10:24.000Z",
          updatedAt: "2024-11-18T13:01:31.000Z",
        },
        {
          id: 4,
          categoryId: 6,
          discountId: null,
          image:
            "https://res.cloudinary.com/dmjd9rohb/image/upload/v1722685846/product/wwtg66zluh2zjqn9jj3y.png",
          title: "organic fertilizer",
          description: "This is a description for organic fertilizer",
          price: 12000,
          quantity: 5,
          isActive: false,
          createdAt: "2024-10-30T06:10:24.000Z",
          updatedAt: "2024-11-12T11:10:09.000Z",
        },
      ];

      Order.findOne.mockResolvedValue(mockOrder);
      Product.findAll.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/order/findId/35")
        .set("_usertkn", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");

      expect(response.body.data.id).toBe(mockOrder.id);
      expect(response.body.data.userId).toBe(mockOrder.userId);
      expect(response.body.data.orderId).toBe(mockOrder.orderId);
      expect(response.body.data.orderStatus).toBe(mockOrder.orderStatus);
      expect(response.body.data.paymentId).toBe(mockOrder.paymentId);

      expect(response.body.data.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Cactus",
            price: 10000,
            quantity: 2,
          }),
          expect.objectContaining({
            id: 4,
            title: "organic fertilizer",
            price: 12000,
            quantity: 2,
          }),
        ])
      );
    });

    it("should return 404 if order is not found", async () => {
      Order.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/order/findId/999")
        .set("_usertkn", "Bearer token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle errors properly", async () => {
      Order.findOne.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/order/findId/1")
        .set("_usertkn", "Bearer token");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });
  describe("POST /api/orders/cancel", () => {
    it("should cancel the order successfully", async () => {
      const mockOrderId = "TpLnts-BoonX-0X2zG";

      cancelTransaction.mockResolvedValueOnce(true);

      Order.update.mockResolvedValueOnce([1]);

      const response = await request(app)
        .post("/api/order/cancel")
        .send({ orderId: mockOrderId });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("successfully cancel");

      expect(cancelTransaction).toHaveBeenCalledWith(mockOrderId);
      expect(Order.update).toHaveBeenCalledWith(
        { orderStatus: "cancelled", paymentStatus: "cancelled" },
        { where: { orderId: mockOrderId } }
      );
    });

    it("should return 500 if cancelTransaction fails", async () => {
      const mockOrderId = "TpLnts-BoonX-0X2zG";

      cancelTransaction.mockRejectedValueOnce(new Error("Transaction failed"));

      const response = await request(app)
        .post("/api/order/cancel")
        .send({ orderId: mockOrderId });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("error");

      expect(cancelTransaction).toHaveBeenCalledWith(mockOrderId);
    });

    it("should return 500 if Order.update fails", async () => {
      const mockOrderId = "TpLnts-BoonX-0X2zG";

      cancelTransaction.mockResolvedValueOnce(true);

      Order.update.mockRejectedValueOnce(new Error("Database update failed"));

      const response = await request(app)
        .post("/api/order/cancel")
        .send({ orderId: mockOrderId });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("error");

      expect(cancelTransaction).toHaveBeenCalledWith(mockOrderId);
      expect(Order.update).toHaveBeenCalledWith(
        { orderStatus: "cancelled", paymentStatus: "cancelled" },
        { where: { orderId: mockOrderId } }
      );
    });
  });
});
