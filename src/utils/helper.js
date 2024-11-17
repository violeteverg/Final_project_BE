const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const { User } = require("../models");

const generateToken = (id, userValue, name, expires) => {
  const token = jwt.sign(
    {
      id,
      userValue,
      name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expires,
    }
  );

  return token;
};
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (typeof token === "string") {
    try {
      // console.log(token, "token");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded, "><><>");
      const decodedName = decoded.name;
      // console.log(decodedName, "<><>>");

      if (decodedName === "VERIFICATION") {
        await User.update({ active: true }, { where: { id: decoded.id } });
        return res.redirect(`${process.env.BASE_URL_FRONTEND}/verify-success`);
      }

      return res.redirect(
        `${process.env.BASE_URL_FRONTEND}/reset-password?token=${token}`
      );
    } catch (error) {
      console.log(error, "<<< ini error");
      return res.redirect(`${process.env.BASE_URL_FRONTEND}/verify-failed`);
    }
  }
};

const emailVerification = async (
  userName,
  email,
  verificationToken,
  title,
  description
) => {
  try {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, "../views/emailVerification.hbs"),
      "utf8"
    );
    const template = Handlebars.compile(emailTemplateSource);
    const htmlToSend = template({
      logoUrl: `https://res.cloudinary.com/dmjd9rohb/image/upload/v1729762401/rb_2149399755-removebg-preview-c_vdkjnd.png`,
      username: userName,
      title: title,
      description: description,
      verificationLink: `${process.env.BASE_URL_FRONTEND}/api/auth/verify-email?token=${verificationToken}`,
    });
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    });
    const mailOption = {
      from: "phinconacademy@gmail.com",
      to: email,
      subject: "Verification Mail",
      html: htmlToSend,
    };
    await transporter.sendMail(mailOption);
  } catch (error) {
    return error?.message;
  }
};

module.exports = { generateToken, verifyEmail, emailVerification };
