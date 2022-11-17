var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to EasyHire!");
});

//authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

//userApi
const userApi = require("./user.api");
router.use("/users", userApi);

//jobApi
const jobApi = require("./job.api");
router.use("/jobs", jobApi);

//bidApi
const bidApi = require("./bid.api");
router.use("/bids", bidApi);

//reviewApi
const reviewApi = require("./review.api");
router.use("/reviews", reviewApi);

//commentApi
const commentApi = require("./comment.api");
router.use("/comments", commentApi);

module.exports = router;
