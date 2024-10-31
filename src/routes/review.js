const { Router } = require("express");
const { findAllReview } = require("../controllers/review");

const reviewRouter = Router();

reviewRouter.get("/findAll", findAllReview);

module.exports = reviewRouter;
