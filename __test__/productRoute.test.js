const request = require("supertest");
const { Product, Category, Review, User } = require("../src/models");
const app = require("../index");
const { uploadImage } = require("../src/services/cloudinaryService");
const productSchema = require("../src/schemas/productSchema");
const { Op } = require("sequelize");
const paginate = require("../src/utils/pagination");

jest.mock("../src/services/cloudinaryService", () => ({
  uploadImage: jest.fn(),
}));

jest.mock("../src/models", () => ({
  Product: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  },
  Category: jest.fn(),
  Review: {
    findAll: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
  },
}));

jest.mock("../src/schemas/productSchema", () => ({
  validate: jest.fn(),
}));

jest.mock("../src/utils/pagination", () => jest.fn());

describe("PRODUCT /api/product", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("POST /api/product/create", () => {
    it("should return 400 if product input is invalid", async () => {
      productSchema.validate.mockReturnValue({
        error: {
          details: [{ message: "Title is required" }],
        },
      });

      const res = await request(app).post("/api/product/create").send({
        price: 100,
        quantity: 10,
        categoryId: 1,
        description: "A test product",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Title is required");
    });

    it("should return 400 if image is not provided", async () => {
      productSchema.validate.mockReturnValue({});

      const res = await request(app).post("/api/product/create").send({
        title: "Test Product",
        price: 100,
        quantity: 10,
        categoryId: 1,
        description: "A test product",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "image is required");
    });

    it("should return 201 and create a product", async () => {
      const mockImg = Buffer.from("fake image content");
      uploadImage.mockResolvedValue({ secure_url: "url" });
      const response = await request(app)
        .post("/api/product/create")
        .set("Content-Type", "multipart/form-data")
        .attach("image", mockImg, "mock-file.jpg")
        .field("title", "baju")
        .field("price", 2000)
        .field("quantity", 10)
        .field("categoryId", 1)
        .field("description", "ini description");

      console.log(response.body, "ini response");

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Product succes create");
    });

    it("should return 500 if an error occurs while creating product", async () => {
      uploadImage.mockRejectedValue(new Error("Failed to upload image"));

      const mockImg = Buffer.from("fake image content");

      const res = await request(app)
        .post("/api/product/create")
        .set("Content-Type", "multipart/form-data")
        .attach("image", mockImg, "mock-file.jpg")
        .field("title", "Test Product")
        .field("price", 100)
        .field("quantity", 10)
        .field("categoryId", 1)
        .field("description", "A test product");
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "An error occurred");
    });
  });
  describe("GET /api/product/findAll", () => {
    //   beforeEach(() => {
    //     jest.clearAllMocks();
    //   });

    it("should return 200 and retrieve all products with pagination filtered by categoryName", async () => {
      const mockProducts = [
        {
          id: 1,
          image: "image1.jpg",
          title: "Product 1",
          description: "Description 1",
          price: 100,
          quantity: 10,
          isActive: true,
          Category: { categoryName: "Category1" },
        },
        {
          id: 2,
          image: "image2.jpg",
          title: "Product 2",
          description: "Description 2",
          price: 200,
          quantity: 5,
          isActive: true,
          Category: { categoryName: "Category2" },
        },
      ];

      const categoryName = "Category1"; // Mock categoryName filter
      const page = 1;
      const limit = 1;

      const mockPagination = {
        data: mockProducts
          .filter((product) => product.Category.categoryName === categoryName)
          .slice(0, limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(mockProducts.length / limit),
          totalItems: mockProducts.length,
        },
      };

      Product.findAll.mockResolvedValue(mockProducts);
      paginate.mockImplementation(() => mockPagination);

      const res = await request(app).get(
        `/api/product/findAll?page=${page}&limit=${limit}&categoryName=${categoryName}`
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Products retrieved successfully");
    });

    it("should return 200 and retrieve all products when no categoryName is provided", async () => {
      const mockProducts = [
        {
          id: 1,
          image: "image1.jpg",
          title: "Product 1",
          description: "Description 1",
          price: 100,
          quantity: 10,
          isActive: true,
        },
        {
          id: 2,
          image: "image2.jpg",
          title: "Product 2",
          description: "Description 2",
          price: 200,
          quantity: 5,
          isActive: true,
        },
      ];

      const page = 1;
      const limit = 1;

      const mockPagination = {
        data: mockProducts.slice(0, limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(mockProducts.length / limit),
          totalItems: mockProducts.length,
        },
      };

      Product.findAll.mockResolvedValue(mockProducts);
      paginate.mockImplementation(() => mockPagination);

      const res = await request(app).get(
        `/api/product/findAll?page=${page}&limit=${limit}`
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Products retrieved successfully");
    });
    it("should return 200 and retrieve all products with search", async () => {
      const mockProducts = [
        {
          id: 1,
          image: "image1.jpg",
          title: "Product 1",
          description: "Description 1",
          price: 100,
          quantity: 10,
          isActive: true,
        },
        {
          id: 2,
          image: "image2.jpg",
          title: "Product 2",
          description: "Description 2",
          price: 200,
          quantity: 5,
          isActive: true,
        },
      ];

      const page = 1;
      const limit = 1;

      const mockPagination = {
        data: mockProducts.slice(0, limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(mockProducts.length / limit),
          totalItems: mockProducts.length,
        },
      };

      Product.findAll.mockResolvedValue(mockProducts);
      paginate.mockImplementation(() => mockPagination);

      const res = await request(app).get(`/api/product/findAll?search=cactus`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Products retrieved successfully");
    });

    it("should return 500 if an error occurs while retrieving products", async () => {
      Product.findAll.mockRejectedValue(new Error("Database error"));

      const res = await request(app).get(
        "/api/product/findAll?page=1&limit=10"
      );

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "An error occurred");
    });
  });
  describe("GET /api/product/findId/:id", () => {
    //   beforeEach(() => {
    //     jest.clearAllMocks();
    //   });

    it("should return 200 and the product details when the product is found", async () => {
      const mockProduct = {
        id: 1,
        image: "image1.jpg",
        title: "Product 1",
        description: "Description 1",
        price: 100,
        quantity: 10,
        categoryId: 2,
        Reviews: [
          {
            id: 1,
            rating: 5,
            comment: "Great product!",
            User: {
              fullName: "John Doe",
              avatar: "avatar1.jpg",
            },
          },
        ],
      };

      Product.findOne.mockResolvedValue(mockProduct);

      const res = await request(app).get("/api/product/findId/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product succes found");
    });

    it("should return 404 when the product is not found", async () => {
      Product.findOne.mockResolvedValue(null);

      const res = await request(app).get("/api/product/findId/999");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("product with id999 not found");
    });

    it("should return 500 when an error occurs", async () => {
      Product.findOne.mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/product/findId/1");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "An error occurred");
    });
  });
  describe("PATCH /api/product/update/:id", () => {
    it("should return 200 and update the product when the product is found", async () => {
      const mockProduct = {
        id: 1,
        title: "Old Product",
        price: 100,
        quantity: 10,
        categoryId: 2,
        description: "Old Description",
        image: "old_image.jpg",
      };

      const updatedProduct = {
        ...mockProduct,
        title: "Updated Product",
        price: 120,
        quantity: 20,
        description: "Updated Description",
        image: "updated_image.jpg",
      };

      Product.findOne.mockResolvedValue(mockProduct);
      uploadImage.mockResolvedValue({ secure_url: "updated_image.jpg" });

      Product.update.mockResolvedValue([1]);
      const res = await request(app)
        .patch("/api/product/update/1")
        .set("Content-Type", "multipart/form-data")
        .attach("image", Buffer.from("fake image content"), "mock-file.jpg") // Simulate file upload
        .field("title", "Updated Product")
        .field("price", 120)
        .field("quantity", 20)
        .field("description", "Updated Description");

      expect(res.status).toBe(200);
    });

    it("should return 404 if the product is not found", async () => {
      Product.findOne.mockResolvedValue(null);

      const res = await request(app).patch("/api/product/update/999");

      expect(res.status).toBe(404);
    });

    it("should return 500 if there is an error during the update", async () => {
      Product.findOne.mockResolvedValue(new Error("Database error"));
      Product.update.mockRejectedValue(new Error("Database error")); // Simulate error during update

      const res = await request(app).patch("/api/product/update/1").send({
        title: "Updated Product",
        price: 120,
        quantity: 20,
        description: "Updated Description",
      });

      expect(res.status).toBe(500);
    });

    it("should use the existing image if no file is uploaded", async () => {
      const mockProduct = {
        id: 1,
        title: "Old Product",
        price: 100,
        quantity: 10,
        categoryId: 2,
        description: "Old Description",
        image: "old_image.jpg",
      };

      Product.findOne.mockResolvedValue(mockProduct);

      Product.update.mockResolvedValue([1]);

      const res = await request(app).patch("/api/product/update/1").send({
        title: "Updated Product",
        price: 120,
        quantity: 20,
        description: "Updated Description",
      });

      expect(res.status).toBe(200);
    });
  });
  describe("PATCH /api/product/delete/:id", () => {
    //   beforeEach(() => {
    //     jest.clearAllMocks();
    //   });

    it("should return 200 and remove the product when the product is found", async () => {
      const mockProduct = {
        id: 1,
        title: "Old Product",
        price: 100,
        quantity: 10,
        categoryId: 2,
        description: "Old Description",
        isActive: true,
        save: jest.fn(),
      };

      Product.findOne.mockResolvedValue(mockProduct);

      const res = await request(app)
        .patch("/api/product/delete/1")
        .send({ isActive: false }); // Simulate setting isActive to false

      expect(res.status).toBe(200);

      expect(mockProduct.save).toHaveBeenCalled();
      expect(mockProduct.isActive).toBe(false); // Ensure isActive is updated
    });

    it("should return 404 if the product is not found", async () => {
      Product.findOne.mockResolvedValue(null); // Simulate product not found

      const res = await request(app)
        .patch("/api/product/delete/999")
        .send({ isActive: false });

      expect(res.status).toBe(404);
    });

    it("should return 500 if there is an error during the operation", async () => {
      Product.findOne.mockResolvedValue(new Error("Database error"));
      Product.save.mockRejectedValue(new Error("Database error")); // Simulate error during save

      const res = await request(app)
        .patch("/api/product/delete/1")
        .send({ isActive: false });

      expect(res.status).toBe(500);
    });
  });
});
