const {
  Register,
  Login,
  loginWithGoogle,
  adminLogin,
  forgetPassword,
  resetVerifyEmail,
  resetPassword,
} = require("../src/controllers/user");
const { User } = require("../src/models");
const bcrypt = require("bcrypt");
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} = require("../src/schemas/authSchema");
const responseStatusMsg = require("../src/helper/responseMessage");
const { generateToken, emailVerification } = require("../src/utils/helper");
const { Op } = require("sequelize");
const admin = require("../src/services/firebase");
const jwt = require("jsonwebtoken");

jest.mock("../src/models", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../src/utils/helper", () => ({
  generateToken: jest.fn(),
  emailVerification: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../src/schemas/authSchema", () => ({
  registerSchema: {
    validate: jest.fn(),
  },
  loginSchema: {
    validate: jest.fn(),
  },
  resetPasswordSchema: {
    validate: jest.fn(),
  },
}));

jest.mock("../src/helper/responseMessage");

jest.mock("../src/services/firebase", () => ({
  auth: jest.fn().mockReturnThis(),
  verifyIdToken: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("User Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("Register Controller", () => {
    beforeEach(() => {
      req.body = {
        fullName: "Test User",
        userName: "testuser",
        email: "test@example.com",
        password: "password123",
      };
    });

    it("should return 400 if validation fails", async () => {
      const validationError = { details: [{ message: "Validation failed" }] };
      registerSchema.validate.mockReturnValue({ error: validationError });

      await Register(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        400,
        "Validation failed",
        "error"
      );
    });

    it("should return 201 if user registration is successful", async () => {
      registerSchema.validate.mockReturnValue({ value: req.body, error: null });
      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue({
        id: 1,
        fullName: "Test User",
        userName: "testuser",
        email: "test@example.com",
      });
      generateToken.mockReturnValue("verificationToken");
      emailVerification.mockResolvedValue();

      await Register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalledWith({
        fullName: "Test User",
        userName: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
      });
      expect(generateToken).toHaveBeenCalledWith(
        1,
        "test@example.com",
        "VERIFICATION",
        "1h"
      );
      expect(emailVerification).toHaveBeenCalledWith(
        "testuser",
        "test@example.com",
        "verificationToken",
        "Verify Your Email Address",
        "Thank you for registering with us! Please click the button below to verify your email address"
      );
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        201,
        "User created",
        "success_data"
      );
    });

    it("should return 500 if an error occurs", async () => {
      registerSchema.validate.mockReturnValue({ value: req.body, error: null });
      bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));

      await Register(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        500,
        "Hashing failed",
        "error",
        null,
        expect.any(Error)
      );
    });
  });

  describe("Login Controller", () => {
    beforeEach(() => {
      req.body = {
        input: "udins",
        password: "password123",
      };
    });

    it("should return 400 if validation fails", async () => {
      req.body = {
        password: "password123",
      };
      const validationError = { details: [{ message: '"input" is required' }] };
      loginSchema.validate.mockReturnValue({ error: validationError });

      await Login(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        400,
        '"input" is required',
        "error"
      );
    });

    it("should return 400 if user is not found", async () => {
      loginSchema.validate.mockReturnValue({ value: req.body, error: null });
      User.findOne.mockResolvedValue(null);
      await Login(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        400,
        "User is not found",
        "error"
      );
    });

    it("should return 401 if email is not verified", async () => {
      loginSchema.validate.mockReturnValue({ value: req.body, error: null });
      User.findOne.mockResolvedValue({
        id: 1,
        userName: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
        active: false,
      });

      await Login(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        401,
        "Please verify your email",
        "error"
      );
    });

    it("should return 400 if password is incorrect", async () => {
      loginSchema.validate.mockReturnValue({ value: req.body, error: null });
      User.findOne.mockResolvedValue({
        id: 1,
        userName: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
        active: true,
      });
      bcrypt.compare.mockResolvedValue(false);

      await Login(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        400,
        "Password must be correct",
        "error"
      );
    });

    it("should return 200 if login is successful", async () => {
      loginSchema.validate.mockReturnValue({ value: req.body, error: null });
      User.findOne.mockResolvedValue({
        active: true,
        dataValues: {
          id: 18,
          userName: "udins",
          email: "test@example.com",
          isAdmin: false,
          token: "loginToken",
        },
      });
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue("loginToken");

      await Login(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        200,
        "Login successful",
        "success_data",
        {
          active: true,
          dataValues: {
            id: 18,
            userName: "udins",
            email: "test@example.com",
            isAdmin: false,
            token: "loginToken",
          },
        }
      );
    });

    it("should return 500 if an error occurs", async () => {
      loginSchema.validate.mockReturnValue({ value: req.body, error: null });
      User.findOne.mockRejectedValue(new Error("Database error"));

      await Login(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        500,
        "An error occurred",
        "error",
        null,
        expect.any(Error)
      );
    });
  });

  describe("loginWithGoogle Controller", () => {
    let req;
    let res;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      jest.clearAllMocks();
    });

    it("should return 200 if login is successful and user exists", async () => {
      const mockIdToken = "testIdToken";
      const decodedToken = { email: "test@example.com", name: "Test User" };

      req.body = { idToken: mockIdToken };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue({
        dataValues: {
          id: 1,
          email: "test@example.com",
          userName: "testuser",
          active: true,
        },
      });
      generateToken.mockReturnValue("loginToken");

      await loginWithGoogle(req, res);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockIdToken);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: decodedToken.email },
        attributes: [
          "id",
          "userName",
          "active",
          "email",
          "password",
          "isAdmin",
        ],
      });

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        200,
        "Login successful",
        "success_data",
        {
          dataValues: {
            id: 1,
            userName: "testuser",
            email: "test@example.com",
            token: "loginToken",
            active: true,
          },
        }
      );
    });

    it("should create a new user if not found in the database", async () => {
      const mockIdToken = "testIdToken";
      const decodedToken = { email: "test@example.com", name: "Test User" };

      req.body = { idToken: mockIdToken };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        dataValues: {
          id: 1,
          email: "test@example.com",
          userName: "testuser",
          active: true,
        },
      });
      generateToken.mockReturnValue("loginToken");
      bcrypt.hash.mockResolvedValue("hashedPassword");

      await loginWithGoogle(req, res);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockIdToken);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: decodedToken.email },
        attributes: [
          "id",
          "userName",
          "active",
          "email",
          "password",
          "isAdmin",
        ],
      });
      expect(User.create).toHaveBeenCalledWith({
        email: decodedToken.email,
        fullName: decodedToken.name,
        userName: decodedToken.email.split("@")[0],
        password: "hashedPassword",
        isAdmin: false,
        active: true,
      });

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        200,
        "Login successful",
        "success_data",
        {
          dataValues: {
            id: 1,
            userName: "testuser",
            email: "test@example.com",
            token: "loginToken",
            active: true,
          },
        }
      );
    });

    it("should return 500 if an error occurs during login", async () => {
      const mockIdToken = "testIdToken";

      req.body = { idToken: mockIdToken };
      const error = new Error("Verification failed");

      admin.auth().verifyIdToken.mockRejectedValue(error);

      await loginWithGoogle(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        500,
        "An error occurred",
        "error",
        null,
        error
      );
    });
  });

  describe("Admin login", () => {
    let req, res;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      jest.clearAllMocks();
    });

    it("should return 200 if admin login is successful", async () => {
      loginSchema.validate.mockReturnValue({ value: req.body, error: null });

      User.findOne.mockResolvedValue({
        isAdmin: true,
        dataValues: {
          active: true,
          id: 1,
          userName: "fauzan",
          email: "milyasa2468@gmail.com",
          isAdmin: true,
          password:
            "$2b$10$jV1LG6hN23Ea4NEWZqwmY.R.o353br0r10t21mFy4PK8kXW3JuT4W",
        },
      });

      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue("adminToken");
      await adminLogin(req, res);
      console.log(res.status.mock.calls);
      console.log(res.send.mock.calls);
      expect(res.status).toHaveBeenCalledWith(200);
      //   expect(res.send).toHaveBeenCalledWith({
      //     code: 200,
      //     status: "success",
      //     message: "Admin login successful",
      //     user: {
      //       active: true,
      //       id: 1,
      //       userName: "fauzan",
      //       email: "milyasa2468@gmail.com",
      //       isAdmin: true,
      //       password:
      //         "$2b$10$jV1LG6hN23Ea4NEWZqwmY.R.o353br0r10t21mFy4PK8kXW3JuT4W",
      //       token: "adminToken",
      //     },
      //   });
    });

    it("should return 404 if user is not found", async () => {
      req.body = { input: "nonexistent@example.com", password: "password" };

      User.findOne.mockResolvedValue(null);

      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        code: 404,
        status: "failed",
        message: "User not found",
      });
    });

    it("should return 403 if user is not an admin", async () => {
      const user = {
        id: 2,
        userName: "normalUser",
        email: "user@example.com",
        isAdmin: false,
        password: await bcrypt.hash("userPassword", 10),
      };

      req.body = { input: "user@example.com", password: "userPassword" };

      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await adminLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        code: 403,
        status: "failed",
        message: "Access denied: Admins only",
      });
    });

    it("should return 400 if password is incorrect", async () => {
      const user = {
        id: 3,
        userName: "adminUser",
        email: "admin@example.com",
        isAdmin: true,
        password: await bcrypt.hash("adminPassword", 10),
      };

      req.body = { input: "admin@example.com", password: "wrongPassword" };

      User.findOne.mockResolvedValue(user); // Mocking user exists
      bcrypt.compare.mockResolvedValue(false); // Mocking password comparison as failed

      await adminLogin(req, res);

      // Check the response for incorrect password
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        code: 400,
        status: "failed",
        message: "Incorrect password",
      });
    });

    it("should return 500 if an error occurs", async () => {
      req.body = { input: "admin@example.com", password: "adminPassword" };

      User.findOne.mockRejectedValue(new Error("Database error"));

      await adminLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        code: 500,
        status: "error",
        message: "An error occurred",
      });
    });
  });
  describe("forgetPassword", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          email: "nonexistent@example.com",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });

    it("should return 404 if user is not found", async () => {
      User.findOne.mockResolvedValue(null);
      await forgetPassword(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        404,
        "User not found with this email",
        "error"
      );
    });
    it("should return 200 if password reset email is sent successfully", async () => {
      const user = {
        id: 1,
        userName: "testuser",
        email: "nonexistent@example.com",
      };
      User.findOne.mockResolvedValue(user);
      emailVerification.mockResolvedValue(true);
      generateToken.mockReturnValue("some-reset-token");

      await forgetPassword(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        200,
        "Password reset email sent successfully.",
        "success_data"
      );

      expect(emailVerification).toHaveBeenCalledWith(
        user.userName,
        user.email,
        "some-reset-token",
        "Reset Your Password",
        "Click the link below to reset your password."
      );
    });

    it("should return 500 if an error occurs", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));

      await forgetPassword(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        500,
        "Database error",
        "error",
        null,
        expect.any(Error)
      );
    });
  });

  describe("resetVerifyEmail", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          email: "user@example.com",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      jest.clearAllMocks();
    });

    it("should return 404 if the user is not found", async () => {
      // Mock the database call to return null
      User.findOne = jest.fn().mockResolvedValue(null);

      // Call the function
      await resetVerifyEmail(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email },
      });
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        404,
        "User not found with this email",
        "error"
      );
    });

    it("should send a verification email if the user is found", async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        userName: "JohnDoe",
        email: "user@example.com",
      });
      emailVerification.mockResolvedValue(true);
      generateToken.mockReturnValue("mockResetToken");
      await resetVerifyEmail(req, res);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email },
      });
      expect(generateToken).toHaveBeenCalledWith(
        1,
        "user@example.com",
        "VERIFICATION",
        "15m"
      );
      expect(emailVerification).toHaveBeenCalledWith(
        "JohnDoe",
        "user@example.com",
        "mockResetToken",
        "Verify Email",
        "Click the link below to verify email again."
      );
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        200,
        "Password reset email sent successfully.",
        "success_data"
      );
    });

    it("should return 500 if an error occurs", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));
      await resetVerifyEmail(req, res);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email },
      });
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        500,
        "Database error",
        "error",
        null,
        expect.any(Error)
      );
    });
  });

  describe("resetPassword", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          newPassword: "NewPassword123!",
        },
        query: {
          token: "mockToken",
        },
      };

      jest.clearAllMocks();
    });

    it("should return 500 if token verification fails", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      await resetPassword(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        req.query.token,
        process.env.JWT_SECRET
      );
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        500,
        "Invalid token",
        "error",
        null,
        expect.any(Error)
      );
    });
    it("should return 400 if password validation fails", async () => {
      jwt.verify.mockReturnValue({ userValue: "user@example.com" });
      resetPasswordSchema.validate.mockReturnValue({
        value: null,
        error: {
          details: [{ message: "Password must be at least 8 characters long" }],
        },
      });
      await resetPassword(req, res);
      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        400,
        "Password must be at least 8 characters long",
        "error"
      );
    });

    it("should reset the password successfully", async () => {
      jwt.verify.mockReturnValue({ userValue: "user@example.com" });
      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.update.mockResolvedValue([1]);
      resetPasswordSchema.validate.mockReturnValue({
        value: { newPassword: "NewPassword123!" },
        error: null,
      });

      await resetPassword(req, res);

      expect(responseStatusMsg).toHaveBeenCalledWith(
        res,
        200,
        "Password reset successful!"
      );
    });
  });
});
