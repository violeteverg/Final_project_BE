const { Order, Product, Cart } = require("../src/models");
const updateOrderStatus = require("../src/services/updateOrder");

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
describe("updateOrderStatus", () => {
  it("should update order and return success", async () => {
    const mockOrder = {
      id: 1,
      userId: 2,
      update: jest.fn(),
      OrderItem: {
        isBuyNow: false,
        orderProduct: [{ productId: 101, quantity: 2 }],
      },
    };

    // Mock database calls
    Order.findOne.mockResolvedValue(mockOrder);
    Product.findOne.mockResolvedValue({ quantity: 10, update: jest.fn() });
    Cart.destroy.mockResolvedValue(true);

    // Call tested function
    const result = await updateOrderStatus(1, "settlement", "12345");

    // Assertions
    expect(Order.findOne).toHaveBeenCalledWith({
      where: { orderId: 1 },
      include: expect.any(Array),
    });
    expect(mockOrder.update).toHaveBeenCalledWith({
      orderStatus: "completed",
      paymentStatus: "paid",
      vaNumber: "12345",
    });
    expect(Product.findOne).toHaveBeenCalledWith({ where: { id: "101" } });

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
