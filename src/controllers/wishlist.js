const responseStatusMsg = require("../helper/responseMessage");
const { Wishlist, Product, User } = require("../models");

const createWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.body.userId;
    if (!productId) {
      return responseStatusMsg(res, 400, "Product Id are required");
    }

    const wishlists = await Wishlist.create({ userId, productId });
    return responseStatusMsg(
      res,
      201,
      "wishlist is added",
      "success_data",
      wishlists
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

const findAllWishlist = async (req, res) => {
  try {
    const userId = req.body.userId;
    const wishlists = await Wishlist.findAll({
      where: { userId },
      attributes: ["id"],
      include: [
        {
          model: Product,
          attributes: ["title", "price", "description"],
        },
      ],
    });
    return responseStatusMsg(
      res,
      200,
      "Wishlist retrieved successfully",
      "success_data",
      wishlists
    );
  } catch (error) {
    console.log(error.message, "message error");
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
const removeWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const wishlists = await Wishlist.findOne({ where: { id, userId } });
    if (!wishlists) {
      return responseStatusMsg(
        res,
        400,
        `wishlist with id ${id} are not found`
      );
    }
    await wishlists.destroy();
    return responseStatusMsg(res, 200, `wishlist with id ${id} are removed`);
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

module.exports = {
  createWishlist,
  findAllWishlist,
  removeWishlist,
};
