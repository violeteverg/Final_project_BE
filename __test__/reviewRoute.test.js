const request = require("supertest");
const { Review, Product } = require("../src/models");
const app = require("../index");
const jwt = require("jsonwebtoken");

jest.mock("../src/models", () => ({
  Review: {
    count: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Review /api/review/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("POST /api/reviews/:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return 201 and create a review successfully", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      const mockReview = {
        id: 1,
        userId: 1,
        productId: 2,
        comment: "Great product!",
        rating: 5,
      };

      Review.create.mockResolvedValue(mockReview);

      const res = await request(app)
        .post("/api/product/review/2")
        .send({
          userId: 1,
          comment: "Great product!",
          rating: 5,
        })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Review is created");
      expect(res.body.result.userId).toBe(mockReview.userId);
      expect(res.body.result.productId).toBe(mockReview.productId);
      expect(res.body.result.comment).toBe(mockReview.comment);
      expect(res.body.result.rating).toBe(mockReview.rating);
    });

    it("should return 500 if an internal server error occurs", async () => {
      jwt.verify.mockReturnValue({
        id: 1,
      });
      Review.create.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .post("/api/product/review/2")
        .send({
          userId: 1,
          comment: "Great product!",
          rating: 5,
        })
        .set("_usertkn", "Bearer token");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("An error occurred");
    });
  });
  describe("GET /api/reviews", () => {
    it("should return 200 and retrieve all reviews successfully", async () => {
      const mockReviews = [
        {
          id: 1,
          rating: 5,
          comment: "Excellent product!",
          product: {
            title: "Product 1",
            price: 100,
            description: "Description of product 1",
          },
          user: {
            fullName: "John Doe",
            avatar: "path/to/avatar.jpg",
          },
        },
        {
          id: 2,
          rating: 4,
          comment: "Good value for the price.",
          product: {
            title: "Product 2",
            price: 50,
            description: "Description of product 2",
          },
          user: {
            fullName: "Jane Smith",
            avatar: "path/to/avatar2.jpg",
          },
        },
      ];

      Review.findAll.mockResolvedValue(mockReviews);

      const res = await request(app).get("/api/review/findAll");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Review retrieved successfully");
      expect(res.body.result[0].id).toBe(mockReviews[0].id);
      expect(res.body.result[0].product.title).toBe(
        mockReviews[0].product.title
      );
      expect(res.body.result[0].user.fullName).toBe(
        mockReviews[0].user.fullName
      );
    });

    it("should return 500 if an internal server error occurs", async () => {
      Review.findAll.mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/review/findAll");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("An error occurred");
    });
  });
});
