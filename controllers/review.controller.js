const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Review = require("../models/Review");

const reviewController = {};

const calculateUserRating = async (userId, newRating) => {
  const user = await User.findById(userId);
  if (user.reviews.length === 0) {
    await User.findByIdAndUpdate(userId, { rating: newRating });
  } else {
    const rating =
      (user.rating * user.reviews.length + newRating) /
      (user.reviews.length + 1);
    await User.findByIdAndUpdate(userId, { rating });
  }
};

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
  //Calculate user new rating
  await calculateUserRating(targetJob.assignee, review.rating);
  //Adding this review to the user who finished the job
  let user = await User.findById(targetJob.assignee);
  user.reviews.push(review._id);
  await user.save();
  //Adding review to target job
  targetJob.review = review._id;
  await targetJob.save();

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
