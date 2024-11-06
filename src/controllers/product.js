const { Op } = require("sequelize");
const responseStatusMsg = require("../helper/responseMessage");
const { Product, Category, Review, User } = require("../models");

const productSchema = require("../schemas/productSchema");
const { uploadImage } = require("../services/cloudinaryService");
const paginate = require("../utils/pagination");

const createProduct = async (req, res) => {
  try {
    // console.log(req.file, "ini file request");

    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { title, price, quantity, categoryId, description } = req.body;

    if (!req?.file) {
      return res.status(400).json({ error: "image is required" });
    }
    const result = await uploadImage(req?.file);

    const products = await Product.create({
      title,
      price: +price,
      quantity: +quantity,
      categoryId: +categoryId,
      description,
      image: result.secure_url,
    });
    return responseStatusMsg(
      res,
      201,
      "Product succes create",
      "success_data",
      products
    );
  } catch (error) {
    console.log(error?.message, "error create product");
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

const findAllProduct = async (req, res) => {
  try {
    const { search, categoryName, page = 1, limit = 10 } = req.query;
    const whereCondition = {
      ...(search && {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const products = await Product.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "image",
        "title",
        "description",
        "price",
        "quantity",
        "isActive",
      ],
      include: [
        {
          model: Category,
          where: categoryName ? { categoryName: categoryName } : undefined,
          required: !!categoryName,
          attributes: ["categoryName"],
        },
      ],
      order: [["id", "ASC"]],
    });
    const { data, pagination } = paginate(products, +page, +limit);

    return responseStatusMsg(
      res,
      200,
      "Products retrieved successfully",
      "success_data",
      { data, pagination }
    );
  } catch (error) {
    console.log(error, "error retrieving products");
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

const findProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.findOne({
      where: { id: id },
      attributes: ["id", "image", "title", "description", "price", "quantity"],
      include: [
        {
          model: Review,
          attributes: ["id", "rating", "comment"],
          include: [
            {
              model: User,
              attributes: ["fullName", "avatar"],
            },
          ],
        },
      ],
    });
    if (!products) {
      return responseStatusMsg(res, 404, `product with id${id} not found`);
    }
    return responseStatusMsg(
      res,
      201,
      "Product succes create",
      "success_data",
      products
    );
  } catch (error) {
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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.findOne({ where: { id: id } });
    if (!products) {
      return responseStatusMsg(res, 404, `Product with id ${id} not found`);
    }
    const {
      title = products.title,
      price = products.price,
      quantity = products.quantity,
      categoryId = products.categoryId,
      description = products.description,
    } = req.body;

    let imageUrl = products.image;
    if (req?.file) {
      const result = await uploadImage(req.file);
      imageUrl = result.secure_url;
    }

    await Product.update(
      {
        title,
        price: +price,
        quantity: +quantity,
        categoryId: +categoryId,
        description,
        image: imageUrl,
      },
      { where: { id: id } }
    );

    return responseStatusMsg(
      res,
      200,
      "Product updated successfully",
      "success_data",
      { id, title, price, quantity, categoryId, description, image: imageUrl }
    );
  } catch (error) {
    console.log(error, "error updating product");
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

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const products = await Product.findOne({ where: { id: id } });

    if (!products) {
      return responseStatusMsg(res, 404, `Product with id ${id} not found`);
    }

    products.isActive = isActive;
    await products.save();
    return responseStatusMsg(res, 200, `product with id ${id} is removed`);
  } catch (error) {
    console.log(error?.message, "message");
    return responseStatusMsg(
      res,
      500,
      "An error occurred",
      "error",
      null,
      error?.message
    );
  }
};

module.exports = {
  createProduct,
  findAllProduct,
  findProductById,
  updateProduct,
  deleteProduct,
};
