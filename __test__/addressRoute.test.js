const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const { Address } = require("../src/models");
const { routes } = require("../src/routes");
const { generateToken } = require("../src/utils/helper");
const responseStatusMsg = require("../src/helper/responseMessage");
const app = require("../index");

jest.mock("../src/models", () => ({
  Address: {
    count: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../src/helper/responseMessage");

describe("POST /api/address/create", () => {
  let app;
  let loginToken;

  beforeAll(() => {
    app = app;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const user = {
      id: 2,
      email: "user@example.com",
      userName: "User Name",
    };

    loginToken = generateToken(
      user.id,
      { email: user.email, userName: user.userName },
      "LOGIN",
      "1d"
    );
  });

  it("should return 403 if token is invalid", async () => {
    const res = await request(app)
      .post("/api/address/create")
      .set("Cookie", ["token=invalid_token"])
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "Invalid token");
  });

  it("should return 401 if token is not provided", async () => {
    const res = await request(app).post("/api/address/create").send({});

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Token not found");
  });

  it("should return 400 if user already has 3 addresses", async () => {
    Address.count.mockResolvedValue(3); // Simulate the user already having 3 addresses

    const res = await request(app)
      .post("/api/address/create")
      .set("Cookie", [`token=${loginToken}`])
      .send({
        fullAddress: "Jl. Senang Banget",
        city: "Solo",
        state: "Jawa Tengah",
        postalCode: "177088",
        country: "Indonesia",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "User can only create 3 addresses"
    );
  });

  it("should create an address if valid data and token are provided", async () => {
    Address.count.mockResolvedValue(0); // Simulate the user having 0 addresses
    Address.findOne.mockResolvedValue(null); // No existing address
    Address.create.mockResolvedValue({
      id: 21,
      userId: 2,
      fullAddress: "Jl. Senang Banget",
      city: "Solo",
      state: "Jawa Tengah",
      postalCode: "177088",
      country: "Indonesia",
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post("/api/address/create")
      .set("Cookie", [`token=${loginToken}`])
      .send({
        fullAddress: "Jl. Senang Banget",
        city: "Solo",
        state: "Jawa Tengah",
        postalCode: "177088",
        country: "Indonesia",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Address successfully created");
    expect(res.body).toHaveProperty(
      "result",
      expect.objectContaining({
        id: 21,
        userId: 2,
        fullAddress: "Jl. Senang Banget",
        city: "Solo",
        state: "Jawa Tengah",
        postalCode: "177088",
        country: "Indonesia",
        isPrimary: true,
      })
    );

    expect(responseStatusMsg).toHaveBeenCalledWith(
      expect.anything(),
      201,
      "Address successfully created",
      "success_data",
      expect.objectContaining({
        id: 21,
        userId: 2,
        fullAddress: "Jl. Senang Banget",
        city: "Solo",
        state: "Jawa Tengah",
        postalCode: "177088",
        country: "Indonesia",
        isPrimary: true,
      }),
      undefined
    );
  });
});
