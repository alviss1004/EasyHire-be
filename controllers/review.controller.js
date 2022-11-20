const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Review = require("../models/Review");

const reviewController = {};

reviewController.createReview = catchAsync(async (req, res, next) => {
  //Get data from request
  const { rating, comment } = req.body;
  const currentUserId = req.userId;
  const targetJobId = req.params.jobId;
  //User can only review their jobs
  let targetJob = await Job.findById(targetJobId);
  if (!targetJob.lister.equals(currentUserId))
    throw new AppError(
      400,
      "User can only review their jobs",
      "Create Review Error"
    );
  //User can only review job with "finished" status
  if (targetJob.status !== "finished")
    throw new AppError(
      400,
      "User can only review finished jobs",
      "Create Review Error"
    );
  //Create review after validation
  let review = await Review.create({
    author: currentUserId,
    targetJob: targetJobId,
    rating,
    comment,
  });
  //Adding this review to review list of the user who did the target job
  let user = await User.findById(targetJob.assignee);
  user.reviews.push(review._id);
  await user.save();

  //Response
  return sendResponse(
    res,
    200,
    true,
    { review },
    null,
    "Create review successfully"
  );
});

module.exports = reviewController;
