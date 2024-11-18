const { generateToken, emailVerification } = require("../utils/helper");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const {
  registerSchema,
  resetPasswordSchema,
  loginSchema,
} = require("../schemas/authSchema");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const responseStatusMsg = require("../helper/responseMessage");
const admin = require("../services/firebase");
const generateRandomString = require("../utils/generateRandomString");

const Register = async (req, res) => {
  try {
    const verfication = "VERIFICATION";
    const { fullName, userName, email, password } = req.body;
    const { value, error } = registerSchema.validate({
      fullName,
      userName,
      email,
      password,
    });

    if (error) {
      return responseStatusMsg(res, 400, error.details[0].message, "error");
    }
    const hashPassword = await bcrypt.hash(value.password, 10);

    const newUser = await User.create({
      fullName: value.fullName,
      userName: value.userName,
      email: value.email,
      password: hashPassword,
    });

    const verificationToken = generateToken(
      newUser.id,
      newUser.email,
      verfication,
      "1h"
    );
    await emailVerification(
      userName,
      email,
      verificationToken,
      "Verify Your Email Address",
      "Thank you for registering with us! Please click the button below to verify your email address"
    );
    return responseStatusMsg(res, 201, "User created", "success_data");
  } catch (error) {
    return responseStatusMsg(res, 500, error.message, "error", null, error);
  }
};

const Login = async (req, res) => {
  try {
    const { input, password } = req.body;
    // console.log(input, "><><>");
    const { value, error } = loginSchema.validate({ input, password });
    const user = await User.findOne({
      attributes: ["id", "userName", "active", "email", "password", "isAdmin"],
      where: {
        [Op.or]: [{ email: value.input }, { userName: value.input }],
      },
    });
    if (error) {
      return res.status(400).send({
        code: 400,
        status: "failed",
        message: error.details[0].message,
      });
    }
    // console.log(user, "user login");
    const loginToken = generateToken(
      user.id,
      { email: user.email, userName: user.userName },
      "LOGIN",
      "1d"
    );

    if (!user) {
      return responseStatusMsg(res, 400, "User is not found", "error");
    }

    const isActive = user.active;
    if (!isActive) {
      return responseStatusMsg(res, 401, "Please verify your email", "error");
    }

    const passwordUser = await bcrypt.compare(password, user.password);
    if (!passwordUser) {
      return responseStatusMsg(res, 400, "Password must be correct", "error");
    }

    delete user.dataValues.password;
    user.dataValues["token"] = loginToken;

    //note:
    // active httponly and secure later
    res.cookie("token", loginToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return responseStatusMsg(
      res,
      200,
      "Login successful",
      "success_data",
      user
    );
  } catch (error) {
    console.log(error);
    return responseStatusMsg(
      res,
      500,
      "An error occurred",
      "error",
      null,
      error
    );
  }
};
const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log(idToken);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    let user = await User.findOne({
      where: { email: decodedToken.email },
      attributes: ["id", "userName", "active", "email", "password", "isAdmin"],
    });
    if (!user) {
      user = await User.create({
        email: decodedToken.email,
        fullName: decodedToken.name,
        userName: decodedToken.email.split("@")[0],
        password: await bcrypt.hash(generateRandomString(100), 10),
        isAdmin: false,
        active: true,
      });
    }
    const loginToken = generateToken(
      user.id,
      { email: user.email, userName: user.userName },
      "LOGIN_GOOGLE",
      "1d"
    );
    delete user.dataValues.password;
    user.dataValues["token"] = loginToken;

    res.cookie("token", loginToken, {
      httpOnly: true,
      secure: true,

      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).send({
      code: 200,
      message: "User successfully logged in!",
      data: user,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: "failed",
      message: error.message,
      code: 500,
    });
  }
};
const adminLogin = async (req, res) => {
  try {
    const { input, password } = req.body;

    const user = await User.findOne({
      attributes: ["id", "userName", "active", "email", "password", "isAdmin"],
      where: {
        [Op.or]: [{ email: input }, { userName: input }],
      },
    });

    if (!user) {
      return res.status(404).send({
        code: 404,
        status: "failed",
        message: "User not found",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).send({
        code: 403,
        status: "failed",
        message: "Access denied: Admins only",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user?.password);
    if (!passwordMatch) {
      return res.status(400).send({
        code: 400,
        status: "failed",
        message: "Incorrect password",
      });
    }

    const loginToken = generateToken(user.id, user.email, "ADMIN", "1d");

    res.cookie("_lgnTkn", loginToken, {
      // httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).send({
      code: 200,
      status: "success",
      message: "Admin login successful",
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      code: 500,
      status: "error",
      message: "An error occurred",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    return responseStatusMsg(res, 200, "cookie already remove", "success_data");
  } catch (error) {
    return responseStatusMsg(res, 500, error.message, "error", null, error);
  }
};
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.cookies.token;

    const { error } = resetPasswordSchema.validate({ newPassword });
    if (error) {
      return responseStatusMsg(res, 400, error.details[0].message, "error");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return responseStatusMsg(res, 404, "User not found", "error");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return responseStatusMsg(
      res,
      200,
      "Password has been reset successfully",
      "success_data"
    );
  } catch (error) {
    return responseStatusMsg(res, 500, error.message, "error", null, error);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return responseStatusMsg(
        res,
        404,
        "User not found with this email",
        "error"
      );
    }

    const resetToken = generateToken(
      user.id,
      user.email,
      "RESET_PASSWORD",
      "15m"
    );

    await emailVerification(
      user.userName,
      email,
      resetToken,
      "Reset Your Password",
      "Click the link below to reset your password."
    );

    return responseStatusMsg(
      res,
      200,
      "Password reset email sent successfully.",
      "success_data"
    );
  } catch (error) {
    return responseStatusMsg(res, 500, error?.message, "error", null, error);
  }
};
const resetPasswordd = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded, ">><decoded");
    const { value, error } = resetPasswordSchema.validate({ newPassword });
    if (error) {
      return responseStatusMsg(res, 400, error.details[0].message, "error");
    }
    const hashedPassword = await bcrypt.hash(value.newPassword, 10);

    const user = await User.update(
      { password: hashedPassword },
      { where: { email: decoded.email } }
    );

    return res.json({ message: "Password reset successful!" });
  } catch (error) {
    return responseStatusMsg(res, 500, error?.message, "error", null, error);
  }
};

module.exports = {
  Register,
  Login,
  loginWithGoogle,
  adminLogin,
  logout,
  resetPassword,
  forgetPassword,
  resetPasswordd,
};
