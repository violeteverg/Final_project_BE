const request = require("supertest");
const { Address } = require("../src/models");
const app = require("../index");
const jwt = require("jsonwebtoken");

jest.mock("../src/models", () => ({
  Address: {
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

describe("POST /api/address/create", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const user = {
      id: 2,
      email: "user@example.com",
      userName: "User Name",
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  //create address
  it("should return 401 if token is not found", async () => {
    const res = await request(app).post("/api/address/create");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Token not found");
  });
  it("should return 403 if token is invalid", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });
    const res = await request(app)
      .post("/api/address/create")
      .set("_usertkn", "Bearer token");
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "Invalid token");
  });
  it("should return 400 and user can only create 3 address", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    let req = {
      fullAddress: "fulladdress",
      city: "Jakarta",
      state: "Jakarta",
      postalCode: 1234567,
      country: "Indonesia",
    };
    Address.count.mockResolvedValue(3);
    const res = await request(app)
      .post("/api/address/create")
      .set("_usertkn", "Bearer token")
      .send(req);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "user only can create 3 adress");
    expect(res.body).toHaveProperty("code", 400);
  });
  it("should return 201 and create new address", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    let req = {
      fullAddress: "fulladdress",
      city: "Jakarta",
      state: "Jakarta",
      postalCode: 1234567,
      country: "Indonesia",
    };
    Address.count.mockResolvedValue(2);
    Address.findOne(true);
    Address.create.mockResolvedValue({
      id: 1,
      fullAddress: "fulladdress",
      city: "Jakarta",
      state: "Jakarta",
      postalCode: 1234567,
      country: "Indonesia",
      userId: 1,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post("/api/address/create")
      .set("_usertkn", "Bearer token")
      .send(req);

    console.log(res.body, "ini req body");
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "address success create");
    expect(res.body).toHaveProperty("code", 201);
    expect(res.body).toHaveProperty("result", {
      id: 1,
      fullAddress: "fulladdress",
      city: "Jakarta",
      state: "Jakarta",
      postalCode: 1234567,
      country: "Indonesia",
      userId: 1,
      isPrimary: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
  it("should return 500 server error ", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    let req = {
      city: "Jakarta",
      state: "Jakarta",
      postalCode: 1234567,
      country: "Indonesia",
    };
    Address.count.mockImplementation(() => {
      throw new Error("Can't count address");
    });

    const res = await request(app)
      .post("/api/address/create")
      .set("_usertkn", "Bearer token")
      .send(req);

    console.log(res.body, "ini req body");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "An error occurred");
    expect(res.body).toHaveProperty("code", 500);
  });

  // find all address
  it("show all address", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    Address.findAll.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        fullAddress: "jl.senang banget ",
        city: "solo",
        state: "jawa tengah",
        postalCode: "177088",
        country: "indonesia",
        isPrimary: false,
        createdAt: "2024-11-19T03:49:33.000Z",
        updatedAt: "2024-11-19T03:49:33.000Z",
      },
    ]);
    const res = await request(app)
      .get("/api/address/findAll")
      .set("_usertkn", "Bearer token");
    console.log(res.body, "ini bodyresponse");
    expect(res.status).toBe(200);
  });
  it("show 500 error address", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    Address.findAll.mockImplementation(() => {
      throw new Error("Can't count address");
    });

    const res = await request(app)
      .get("/api/address/findAll")
      .set("_usertkn", "Bearer token");

    expect(res.status).toBe(500);
  });

  //update adddress
  it("should return 404 if address is not found", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });

    Address.findOne.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/address/update/1")
      .set("_usertkn", "Bearer token")
      .send({
        fullAddress: "new address",
        city: "new city",
        state: "new state",
        postalCode: "123456",
        country: "new country",
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "address not found");
    expect(res.body).toHaveProperty("code", 404);
  });
  it("should return 200 if update address success", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    const mockAddress = {
      id: 22,
      userId: 18,
      fullAddress: "jl.bahagia",
      city: "bandung",
      state: "old state",
      postalCode: "654321",
      country: "old country",
      isPrimary: false,
      createdAt: "2024-11-19T03:49:33.000Z",
      updatedAt: "2024-11-19T04:38:24.225Z",
      update: jest.fn().mockResolvedValue(true),
    };
    Address.findOne.mockResolvedValue(mockAddress);
    const res = await request(app)
      .patch("/api/address/update/1")
      .set("_usertkn", "Bearer token")
      .send({
        fullAddress: "jl.bahagia",
        city: "bandung",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Alamat berhasil diupdate.");
    expect(res.body).toHaveProperty("code", 200);
    expect(res.body).toHaveProperty("result", {
      id: 22,
      userId: 18,
      fullAddress: "jl.bahagia",
      city: "bandung",
      state: "old state",
      postalCode: "654321",
      country: "old country",
      isPrimary: false,
      createdAt: "2024-11-19T03:49:33.000Z",
      updatedAt: "2024-11-19T04:38:24.225Z",
    });

    expect(mockAddress.update).toHaveBeenCalledWith({
      fullAddress: "jl.bahagia",
      city: "bandung",
    });
  });
  it("should return 500 if update address failed", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    Address.findOne.mockImplementation(() => {
      throw new Error("Can't find address");
    });
    const res = await request(app)
      .patch("/api/address/update/1")
      .set("_usertkn", "Bearer token")
      .send({
        fullAddress: "new address",
        city: "new city",
        state: "new state",
        postalCode: "123456",
        country: "new country",
      });
    expect(res.status).toBe(500);
  });

  //remove address
  it("should return 404 if the address is not found", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    Address.findOne.mockResolvedValue(null);
    const res = await request(app)
      .delete("/api/address/delete/22")
      .set("_usertkn", "Bearer token");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "address not found.");
    expect(res.body).toHaveProperty("code", 404);
  });
  it("should return 200 and successfully remove the address", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });

    const mockAddress = {
      id: 22,
      userId: 1,
      fullAddress: "jl. bahagia",
      city: "bandung",
      state: "jawa tengah",
      postalCode: "177088",
      country: "indonesia",
      destroy: jest.fn().mockResolvedValue(true),
    };

    Address.findOne.mockResolvedValue(mockAddress);

    const res = await request(app)
      .delete("/api/address/delete/22")
      .set("_usertkn", "Bearer token");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "address successfully removed");
    expect(res.body).toHaveProperty("code", 200);

    expect(mockAddress.destroy).toHaveBeenCalled();
  });
  it("should return 500 and failed remove the address", async () => {
    jwt.verify.mockReturnValue({
      id: 1,
    });
    Address.findOne.mockImplementation(() => {
      throw new Error("Can't count address");
    });

    const res = await request(app)
      .delete("/api/address/delete/22")
      .set("_usertkn", "Bearer token");

    expect(res.status).toBe(500);
  });
});
