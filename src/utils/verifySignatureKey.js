const crypto = require("crypto");

const verifySignatureKey = (signatureKey, orderId, statusCode, grossAmount) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const payload = orderId + statusCode + grossAmount + serverKey;

  // Hash the payload using SHA512
  const calculatedSignatureKey = crypto
    .createHash("sha512")
    .update(payload)
    .digest("hex");

  return calculatedSignatureKey === signatureKey;
};

module.exports = verifySignatureKey;
