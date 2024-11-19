const responseStatusMsg = require("../helper/responseMessage");
const { Review, Product, User } = require("../models");

const createReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { comment, rating } = req.body;
    const userId = req.body.userId;

    const reviews = await Review.create({ userId, productId, comment, rating });
    return responseStatusMsg(
      res,
      201,
      "Review is created",
      "success_data",
      reviews
    );
  } catch (error) {
    console.log(error.message, "ini error");
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
const findAllReview = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      attributes: ["id", "rating", "comment"],
      include: [
        {
          model: Product,
          attributes: ["title", "price", "description"],
        },
        {
          model: User,
          attributes: ["fullName", "avatar"],
        },
      ],
    });
    return responseStatusMsg(
      res,
      200,
      "Review retrieved successfully",
      "success_data",
      reviews
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

module.exports = { createReview, findAllReview };
