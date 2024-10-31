const responseStatusMsg = require("../helper/responseMessage");
const { Address } = require("../models");

const createAdress = async (req, res) => {
  try {
    const { fullAddress, city, state, postalCode, country } = req.body;
    const userId = req.body.userId;
    const addressCount = await Address.count({ where: { userId } });
    if (addressCount >= 3) {
      return responseStatusMsg(res, 400, "user only can create 3 adress");
    }

    const primaryAddressExists = await Address.findOne({
      where: { userId, isPrimary: true },
    });

    const isPrimary = !primaryAddressExists;

    const addresses = await Address.create({
      userId,
      fullAddress,
      city,
      state,
      postalCode,
      country,
      isPrimary,
    });

    return responseStatusMsg(
      res,
      201,
      "address success create",
      "success_data",
      addresses
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

const findAllAdress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const addresses = await Address.findAll({ where: { userId } });
    return responseStatusMsg(
      res,
      200,
      "address retrieved successfully",
      "success_data",
      addresses
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
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullAddress, city, state, postalCode, country } = req.body;
    const userId = req.body.userId;

    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return responseStatusMsg(res, 404, "address not found");
    }
    await address.update({
      fullAddress,
      city,
      state,
      postalCode,
      country,
    });

    return responseStatusMsg(
      res,
      200,
      "Alamat berhasil diupdate.",
      "success_data",
      address
    );
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Terjadi kesalahan saat mengupdate alamat.",
      "error",
      null,
      error
    );
  }
};

const removeAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return responseStatusMsg(res, 404, "address not found.");
    }
    await address.destroy();

    return responseStatusMsg(
      res,
      200,
      "address successfully removed",
      "success_data",
      null
    );
  } catch (error) {
    return responseStatusMsg(
      res,
      500,
      "Terjadi kesalahan saat menghapus alamat.",
      "error",
      null,
      error
    );
  }
};
module.exports = {
  createAdress,
  findAllAdress,
  updateAddress,
  removeAddress,
};
