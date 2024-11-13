const { Router } = require("express");
const {
  Register,
  Login,
  adminLogin,
  logout,
  resetPassword,
  forgetPassword,
  resetPasswordd,
  loginWithGoogle,
} = require("../controllers/user");
const { verifyEmail } = require("../utils/helper");

const userRouter = Router();

userRouter.post("/register", Register);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/login", Login);
userRouter.post("/login-google", loginWithGoogle);
userRouter.post("/admin-login", adminLogin);
userRouter.post("/logout", logout);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/forgetreset-password", resetPasswordd);

module.exports = userRouter;
