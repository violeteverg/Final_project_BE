const jwt = require("jsonwebtoken");

const getUserId = async (req, res, next) => {
  try {
    const token = req.headers["_usertkn"];
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = payload.id;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = getUserId;
