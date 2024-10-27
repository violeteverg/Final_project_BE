const Joi = require("joi");

const PASSWORD_REGEX = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})"
);
const registerSchema = Joi.object({
  fullName: Joi.string().min(5).max(15).required(),
  userName: Joi.string().min(5).max(8).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().pattern(PASSWORD_REGEX).min(8).required(),
});

const loginSchema = Joi.object().keys({
  input: Joi.string().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required().messages({
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
};
