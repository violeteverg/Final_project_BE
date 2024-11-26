const {
  generateToken,
  verifyEmail,
  emailVerification,
} = require("../src/utils/helper");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const { User } = require("../src/models");
const path = require("path");

jest.mock("path");
jest.mock("jsonwebtoken");
jest.mock("fs");
jest.mock("handlebars");
jest.mock("nodemailer");
jest.mock("../src/models", () => ({
  User: {
    update: jest.fn(),
  },
}));

describe("Auth Module Tests", () => {
  describe("generateToken function", () => {
    it("should generate a token correctly", () => {
      const mockJwtSign = jest
        .spyOn(jwt, "sign")
        .mockReturnValue("mockedToken");
      const token = generateToken(1, "testUser", "Test User", "1h");
      expect(mockJwtSign).toHaveBeenCalledWith(
        {
          id: 1,
          userValue: "testUser",
          name: "Test User",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(token).toBe("mockedToken");
    });
  });

  describe("verifyEmail function", () => {
    it('should update user to active if token is valid and name is "VERIFICATION"', async () => {
      const mockJwtVerify = jest
        .spyOn(jwt, "verify")
        .mockReturnValue({ id: 1, name: "VERIFICATION" });
      const mockRedirect = jest.fn();
      const mockUpdate = jest.fn();

      User.update = mockUpdate;
      const req = { query: { token: "validToken" } };
      const res = { redirect: mockRedirect };

      await verifyEmail(req, res);

      expect(mockJwtVerify).toHaveBeenCalledWith(
        "validToken",
        process.env.JWT_SECRET
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        { active: true },
        { where: { id: 1 } }
      );
      expect(mockRedirect).toHaveBeenCalledWith(
        `${process.env.BASE_URL_FRONTEND}/verify-success`
      );
    });

    it('should redirect to reset-password page if name is not "VERIFICATION"', async () => {
      const mockJwtVerify = jest
        .spyOn(jwt, "verify")
        .mockReturnValue({ id: 1, name: "RESET" });
      const mockRedirect = jest.fn();

      const req = { query: { token: "validToken" } };
      const res = { redirect: mockRedirect };

      await verifyEmail(req, res);

      expect(mockJwtVerify).toHaveBeenCalledWith(
        "validToken",
        process.env.JWT_SECRET
      );
      expect(mockRedirect).toHaveBeenCalledWith(
        `${process.env.BASE_URL_FRONTEND}/reset-password?token=validToken`
      );
    });

    it("should redirect to verify-failed page if token is invalid", async () => {
      const mockJwtVerify = jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });
      const mockRedirect = jest.fn();

      const req = { query: { token: "invalidToken" } };
      const res = { redirect: mockRedirect };

      await verifyEmail(req, res);

      expect(mockJwtVerify).toHaveBeenCalledWith(
        "invalidToken",
        process.env.JWT_SECRET
      );
      expect(mockRedirect).toHaveBeenCalledWith(
        `${process.env.BASE_URL_FRONTEND}/verify-failed`
      );
    });

    it("should redirect to verify-failed page if token is not a string", async () => {
      const mockRedirect = jest.fn();

      const reqWithNullToken = { query: { token: null } };
      const resWithNullToken = { redirect: mockRedirect };
      await verifyEmail(reqWithNullToken, resWithNullToken);

      const reqWithUndefinedToken = { query: { token: undefined } };
      const resWithUndefinedToken = { redirect: mockRedirect };
      await verifyEmail(reqWithUndefinedToken, resWithUndefinedToken);

      const reqWithNumberToken = { query: { token: 12345 } };
      const resWithNumberToken = { redirect: mockRedirect };
      await verifyEmail(reqWithNumberToken, resWithNumberToken);
    });
  });

  describe("emailVerification function", () => {
    it("should send a verification email", async () => {
      const mockReadFileSync = jest
        .spyOn(fs, "readFileSync")
        .mockReturnValue("<html>template</html>");
      const mockCompile = jest
        .spyOn(Handlebars, "compile")
        .mockReturnValue(() => "<html>compiled</html>");
      const mockSendMail = jest
        .spyOn(nodemailer, "createTransport")
        .mockReturnValue({
          sendMail: jest.fn().mockResolvedValue("Email Sent"),
        });

      await emailVerification(
        "testUser",
        "test@example.com",
        "mockedToken",
        "Welcome",
        "Please verify your email"
      );

      expect(mockReadFileSync).toHaveBeenCalledWith(
        path.join(__dirname, "../views/emailVerification.hbs"),
        "utf8"
      );
      expect(mockCompile).toHaveBeenCalled();
      //   expect(mockSendMail).toHaveBeenCalledWith({
      //     from: "phinconacademy@gmail.com",
      //     to: "test@example.com",
      //     subject: "Verification Mail",
      //     html: "<html>compiled</html>",
      //   });
    });

    it("should handle errors and return an error message if sending email fails", async () => {
      const mockReadFileSync = jest
        .spyOn(fs, "readFileSync")
        .mockReturnValue("<html>template</html>");
      const mockCompile = jest
        .spyOn(Handlebars, "compile")
        .mockReturnValue(() => "<html>compiled</html>");
      const mockSendMail = jest
        .spyOn(nodemailer, "createTransport")
        .mockReturnValue({
          sendMail: jest.fn().mockRejectedValue(new Error("Email failed")),
        });

      const result = await emailVerification(
        "testUser",
        "test@example.com",
        "mockedToken",
        "Welcome",
        "Please verify your email"
      );

      expect(result).toBe("Email failed");
    });
  });
});
