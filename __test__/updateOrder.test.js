const { Order, Product, Cart } = require("../src/models");
const {
  updateOrderStatus,
  getOrderStatus,
} = require("../src/services/updateOrder");

jest.mock("../src/models", () => ({
  Order: {
    findOne: jest.fn(),
    update: jest.fn(),
  },
  Product: {
    findOne: jest.fn(),
  },
  OrderItem: jest.fn(),
  Cart: {
    destroy: jest.fn(),
  },
}));

jest.mock("../src/services/updateOrder", () => {
  const originalModule = jest.requireActual("../src/services/updateOrder");

  return {
    ...originalModule,
    removeProductsFromCart: jest.fn(),
    updateProductQuantities: jest.fn(),
  };
});

describe("update order", () => {
  describe("updateOrderStatus", () => {
    it("should update product quantities when order is completed and stock is sufficient", async () => {
      const mockProduct = { quantity: 10, update: jest.fn() };
      const mockOrder = {
        id: 1,
        userId: 2,
        update: jest.fn(),
        OrderItem: {
          isBuyNow: false,
          orderProduct: [{ productId: 101, quantity: 3 }],
        },
      };

      Order.findOne.mockResolvedValue(mockOrder);
      Product.findOne.mockResolvedValue(mockProduct);
      Cart.destroy.mockResolvedValue(true);

      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(Order.findOne).toHaveBeenCalledWith({
        where: { orderId: 1 },
        include: expect.any(Array),
      });
      expect(mockProduct.update).toHaveBeenCalledWith({ quantity: 7 });
      expect(result).toEqual({
        success: true,
        message: "Order and product quantity updated successfully",
      });
    });

    it("should set product quantity to zero if stock is insufficient", async () => {
      const mockProduct = { quantity: 2, update: jest.fn() };
      const mockOrder = {
        id: 1,
        userId: 2,
        update: jest.fn(),
        OrderItem: {
          isBuyNow: false,
          orderProduct: [{ productId: 102, quantity: 5 }],
        },
      };

      Order.findOne.mockResolvedValue(mockOrder);
      Product.findOne.mockResolvedValue(mockProduct);
      Cart.destroy.mockResolvedValue(true);

      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(mockProduct.update).toHaveBeenCalledWith({ quantity: 0 });
      expect(result).toEqual({
        success: true,
        message: "Order and product quantity updated successfully",
      });
    });

    it("should return an error if order is not found", async () => {
      Order.findOne.mockResolvedValue(null);

      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(Order.findOne).toHaveBeenCalledWith({
        where: { orderId: 1 },
        include: expect.any(Array),
      });
      expect(result).toEqual({
        success: false,
        message: "Order not found",
      });
    });

    it("should do nothing if product is not found", async () => {
      const mockOrder = {
        id: 1,
        userId: 2,
        update: jest.fn(),
        OrderItem: {
          isBuyNow: false,
          orderProduct: [{ productId: 103, quantity: 2 }],
        },
      };

      Order.findOne.mockResolvedValue(mockOrder);
      Product.findOne.mockResolvedValue(null);
      Cart.destroy.mockResolvedValue(true);

      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(Product.findOne).toHaveBeenCalledWith({ where: { id: "103" } });
      expect(result).toEqual({
        success: true,
        message: "Order and product quantity updated successfully",
      });
    });
    it("should handle errors gracefully when Order.findOne fails", async () => {
      Order.findOne.mockRejectedValue(new Error("Database connection error"));

      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(result).toEqual({
        success: false,
        message: "Failed to update order status and product quantity",
      });
    });
  });

  describe("updateOrderStatus - specific conditions", () => {
    const {
      removeProductsFromCart,
      updateProductQuantities,
    } = require("../src/services/updateOrder");

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should call updateProductQuantities when orderStatus is 'completed'", async () => {
      const mockOrder = {
        id: 1,
        userId: 2,
        update: jest.fn(),
        OrderItem: {
          isBuyNow: false,
          orderProduct: [{ productId: 101, quantity: 2 }],
        },
      };

      Order.findOne.mockResolvedValue(mockOrder);
      const result = await updateOrderStatus(1, "completed", "12345");

      expect(removeProductsFromCart).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: "Order and product quantity updated successfully",
      });
    });

    it("should call removeProductsFromCart when orderStatus is 'completed' and isBuyNow is false", async () => {
      const mockOrder = {
        id: 1,
        userId: 2,
        update: jest.fn(),
        OrderItem: {
          isBuyNow: false,
          orderProduct: [{ productId: 101, quantity: 2 }],
        },
      };

      Order.findOne.mockResolvedValue(mockOrder);

      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(result).toEqual({
        success: true,
        message: "Order and product quantity updated successfully",
      });
    });

    it("should not call removeProductsFromCart when orderStatus is 'completed' but isBuyNow is true", async () => {
      const mockOrder = {
        id: 1,
        userId: 2,
        update: jest.fn(),
        OrderItem: {
          isBuyNow: true,
          orderProduct: [{ productId: 101, quantity: 2 }],
        },
      };

      Order.findOne.mockResolvedValue(mockOrder);
      const result = await updateOrderStatus(1, "settlement", "12345");

      expect(removeProductsFromCart).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        message: "Order and product quantity updated successfully",
      });
    });
  });

  describe("getOrderStatus", () => {
    it("should return 'completed' and 'paid' for settlement", () => {
      const result = getOrderStatus("settlement");
      expect(result).toEqual({
        orderStatus: "completed",
        paymentStatus: "paid",
      });
    });

    it("should return 'pending' and 'pending' for pending", () => {
      const result = getOrderStatus("pending");
      expect(result).toEqual({
        orderStatus: "pending",
        paymentStatus: "pending",
      });
    });

    it("should return 'expire' and 'expire' for expire", () => {
      const result = getOrderStatus("expire");
      expect(result).toEqual({
        orderStatus: "expire",
        paymentStatus: "expire",
      });
    });

    it("should return 'none' and 'none' for unknown transaction status", () => {
      const result = getOrderStatus("unknown_status");
      expect(result).toEqual({
        orderStatus: "none",
        paymentStatus: "none",
      });
    });
  });
});
