const Joi = require("joi");

const productSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    "string.base": "Title must be a string.",
    "string.empty": "Title is required.",
    "string.min": "Title must be at least 1 character long.",
    "string.max": "Title must not exceed 255 characters.",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
    "any.required": "Price is required.",
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Quantity must be a number.",
    "number.integer": "Quantity must be an integer.",
    "number.min": "Quantity must be at least 0.",
    "any.required": "Quantity is required.",
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    "number.base": "Category ID must be a number.",
    "number.integer": "Category ID must be an integer.",
    "number.positive": "Category ID must be a positive number.",
    "any.required": "Category ID is required.",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.base": "Description must be a string.",
    "string.max": "Description must not exceed 500 characters.",
  }),
});

module.exports = productSchema;
