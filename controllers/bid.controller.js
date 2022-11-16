const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Job = require("../models/Job");

const bidController = {};

const calculateBidCount = async (jobId) => {
  const bidCount = await Bid.countDocuments({
    targetJob: jobId,
  });
  await Job.findByIdAndUpdate(jobId, { bidCount });
};

bidController.createBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const { price } = req.body;
  const currentUserId = req.userId;
  const jobId = req.params.id;
  //Checking if user already had a bid on this job
  let checkBid = await Bid.find({ bidder: currentUserId, targetJob: jobId });
  if (checkBid)
    throw new AppError(
      400,
      "User can only bid once per job",
      "Create Bid Error"
    );
  //Create bid after validation
  let bid = await Bid.create({
    bidder: currentUserId,
    targetJob: jobId,
    price,
  });
  await calculateBidCount(jobId);
  //Response
  return sendResponse(res, 200, true, { bid }, null, "Create bid successfully");
});

bidController.acceptBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const bidId = req.params.id;
  //Business Logic Validation
  let bid = await Bid.findById(bidId);
  if (!bid) throw new AppError(400, "Bid not found", "Accept Bid Error");

  let targetJob = await Job.findById(bid.toJSON().targetJob);
  if (!targetJob.lister.equals(currentUserId))
    throw new AppError(400, "Only lister can accept bid", "Accept Bid Error");

  //Process
  bid.status = "accepted";
  targetJob.assignee = bid.bidder;
  await bid.save();

  //Response
  return sendResponse(res, 200, true, { bid }, null, "Accept bid successfully");
});

bidController.deleteBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const bidId = req.params.id;
  //Business Logic Validation
  let bid = await Bid.findOne({ _id: bidId, bidder: currentUserId });

  if (!bid)
    throw new AppError(
      400,
      "Bid not found or User is not authorized",
      "Delete Bid Error"
    );

  const jobId = bid.targetJob;
  await Bid.findOneAndDelete({ _id: bidId, bidder: currentUserId });

  await calculateBidCount(jobId);

  //Response
  return sendResponse(res, 200, true, { bid }, null, "Delete bid successfully");
});

module.exports = bidController;
