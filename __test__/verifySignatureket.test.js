const crypto = require("crypto");
const verifySignatureKey = require("../src/utils/verifySignatureKey");

jest.mock("crypto");

describe("verifySignatureKey", () => {
  it("should return true when the signature key is correct", () => {
    process.env.MIDTRANS_SERVER_KEY = "mockServerKey";
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("mockCalculatedSignatureKey"),
    };
    crypto.createHash.mockReturnValue(mockHash);
    const signatureKey = "mockCalculatedSignatureKey";
    const orderId = "12345";
    const statusCode = "200";
    const grossAmount = "1000";

    const result = verifySignatureKey(
      signatureKey,
      orderId,
      statusCode,
      grossAmount
    );
    expect(result).toBe(true);
    expect(crypto.createHash).toHaveBeenCalledWith("sha512");
    expect(mockHash.update).toHaveBeenCalledWith("123452001000mockServerKey");
    expect(mockHash.digest).toHaveBeenCalledWith("hex");
  });
});
