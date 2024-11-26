const request = require("supertest");
const { Cart, Product } = require("../src/models");
const app = require("../index");
const jwt = require("jsonwebtoken");

jest.mock("../src/models", () => ({
  Cart: {
    count: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Product: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Cart /api/cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("Post /api/cart/create", () => {
    it("should return 400 if productId or quantity is missing", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const res = await request(app)
        .post("/api/cart/create")
        .set("_usertkn", "Bearer token")
        .send({ productId: 1 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "Product ID and quantity are required"
      );
    });
    it("should return 404 if product is not found", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });

      Product.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/cart/create")
        .send({ productId: 1, quantity: 2 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Product not found");
    });
    it("should return 400 if requested quantity exceeds available stock", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });

      Product.findByPk.mockResolvedValue({ quantity: 5 });

      const res = await request(app)
        .post("/api/cart/create")
        .send({ productId: 1, quantity: 10 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        "Requested quantity exceeds available stock. Available stock: 5"
      );
    });
    it("should return 200 and update the quantity if item already exists in cart", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });

      Product.findByPk.mockResolvedValue({ quantity: 10 });

      const existingCartItem = {
        quantity: 2,
        save: jest.fn().mockResolvedValue(true),
      };

      Cart.findOne.mockResolvedValue(existingCartItem);

      const res = await request(app)
        .post("/api/cart/create")
        .send({ productId: 1, quantity: 3 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Quantity updated in cart");
      expect(existingCartItem.save).toHaveBeenCalled();
    });
    it("should return 404 if adding quantity exceeds available stock", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Product.findByPk.mockResolvedValue({
        quantity: 5,
      });
      Cart.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        productId: 1,
        quantity: 3,
        save: jest.fn(),
      });

      const res = await request(app)
        .post("/api/cart/create")
        .send({ productId: 1, quantity: 3 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        "Adding this quantity exceeds available stock. Available stock: 5"
      );
    });
    it("should return 200 and add the item to the cart if it's new", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });

      Product.findByPk.mockResolvedValue({ quantity: 10 });
      Cart.findOne.mockResolvedValue(null);

      const newCartItem = { id: 1, productId: 8, quantity: 2, userId: 1 };
      Cart.create.mockResolvedValue(newCartItem);

      const res = await request(app)
        .post("/api/cart/create")
        .send({ productId: 1, quantity: 2 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item added to cart");
      expect(res.body.result).toEqual(newCartItem);
      expect(Cart.create).toHaveBeenCalledWith({
        userId: 1,
        productId: 1,
        quantity: 2,
      });
    });
    it("should return 500 if an internal server error occurs", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Product.findByPk.mockRejectedValue(new Error("Database error"));
      const res = await request(app)
        .post("/api/cart/create")
        .send({ productId: 1, quantity: 2 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to create cart item");
    });
  });
  describe("GET /api/cart/findAll", () => {
    it("should return 200 and a list of cart items for the user", async () => {
      jwt.verify.mockReturnValue({ id: 1 });

      const mockCartItems = [
        {
          id: 1,
          userId: 1,
          productId: 2,
          quantity: 3,
          Product: {
            title: "Sample Product",
            price: 100,
            description: "A sample product",
            image: "sample.jpg",
          },
        },
      ];
      Cart.findAll.mockResolvedValue(mockCartItems);

      const res = await request(app)
        .get("/api/cart/findAll")
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart items retrieved successfully");
      expect(res.body.result).toEqual(mockCartItems);

      expect(Cart.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: [
          {
            model: Product,
            attributes: ["title", "price", "description", "image"],
          },
        ],
      });
    });

    it("should return 500 if an error occurs while retrieving cart items", async () => {
      jwt.verify.mockReturnValue({ id: 1 });

      Cart.findAll.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .get("/api/cart/findAll")
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to retrieve cart items");
    });
  });
  describe("GET /api/cart/count", () => {
    it("should return 200 and the total quantity of cart items for a user", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCartItems = [
        { quantity: 2, Product: { quantity: 10 } },
        { quantity: 3, Product: { quantity: 5 } },
      ];

      Cart.findAll.mockResolvedValue(mockCartItems);

      const res = await request(app)
        .get("/api/cart/count")
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalQuantity", 5);
    });
    it("should return 200 with unkown quantity", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCartItems = [
        { Product: { quantity: 10 } },
        { Product: { quantity: 5 } },
      ];

      Cart.findAll.mockResolvedValue(mockCartItems);

      const res = await request(app)
        .get("/api/cart/count")
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalQuantity", 0);
    });

    it("should return 200 with totalQuantity as 0 if the cart is empty", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Cart.findAll.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/cart/count")
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalQuantity", 0);
    });

    it("should return 500 if an internal server error occurs", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Cart.findAll.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .get("/api/cart/count")
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        "message",
        "Failed to retrieve cart items"
      );
    });
  });
  describe("POST /api/cart/update/:id", () => {
    it("should return 200 and update the cart item successfully", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCart = {
        id: 1,
        userId: 1,
        productId: 2,
        quantity: 3,
        update: jest.fn().mockResolvedValue(true),
      };

      const mockProduct = {
        id: 2,
        quantity: 10,
      };

      Cart.findOne.mockResolvedValue(mockCart);
      Product.findOne.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post("/api/cart/update/1")
        .send({ userId: 1, quantity: 5 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart item updated successfully");
      expect(mockCart.update).toHaveBeenCalledWith({ quantity: 5 });
    });

    it("should return 404 if the cart item is not found", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Cart.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/cart/update/1")
        .send({ userId: 1, quantity: 5 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Cart item not found");
      expect(res.body.code).toBe(404);
    });

    it("should return 404 if the product is not found", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCart = {
        id: 1,
        userId: 1,
        productId: 2,
        quantity: 3,
      };

      Cart.findOne.mockResolvedValue(mockCart);
      Product.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/cart/update/1")
        .send({ userId: 1, quantity: 5 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Product not found");
      expect(res.body.code).toBe(404);
    });

    it("should return 404 if the requested quantity exceeds product stock", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCart = {
        id: 1,
        userId: 1,
        productId: 2,
        quantity: 3,
      };

      const mockProduct = {
        id: 2,
        quantity: 5,
      };

      Cart.findOne.mockResolvedValue(mockCart);
      Product.findOne.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post("/api/cart/update/1")
        .send({ userId: 1, quantity: 10 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        "Product with ID 2 does not have enough stock"
      );
      expect(res.body.code).toBe(404);
    });

    it("should return 200 and update the cart item when quantity is unchanged", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCart = {
        id: 1,
        userId: 1,
        productId: 2,
        quantity: 3,
        update: jest.fn().mockResolvedValue(true),
      };

      const mockProduct = {
        id: 2,
        quantity: 10,
      };

      Cart.findOne.mockResolvedValue(mockCart);
      Product.findOne.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post("/api/cart/update/1")
        .send({ userId: 1, quantity: 3 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart item updated successfully");
      expect(res.body.code).toBe(200);
    });

    it("should return 500 if an internal server error occurs", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Cart.findOne.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .post("/api/cart/update/1")
        .send({ userId: 1, quantity: 5 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to update cart item");
    });
  });
  describe("DELETE /api/cart/remove/:id", () => {
    it("should return 200 and remove the cart item successfully", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockCartItem = {
        id: 1,
        userId: 1,
        productId: 2,
        quantity: 3,
        destroy: jest.fn().mockResolvedValue(true),
      };

      Cart.findOne.mockResolvedValue(mockCartItem);

      const res = await request(app)
        .delete("/api/cart/delete/1")
        .send({ userId: 1 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart item removed successfully");
      expect(mockCartItem.destroy).toHaveBeenCalled();
    });

    it("should return 404 if the cart item is not found", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Cart.findOne.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/cart/delete/1")
        .send({ userId: 1 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Cart item not found");
    });

    it("should return 500 if an internal server error occurs", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Cart.findOne.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .delete("/api/cart/delete/1")
        .send({ userId: 1 })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to remove cart item");
    });
  });
});
