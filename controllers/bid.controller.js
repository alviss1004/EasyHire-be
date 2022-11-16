const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Job = require("../models/Job");

const bidController = {};

//Update bid count on job
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
  const targetJobId = req.params.jobId;
  //Checking if user already had a bid on this job
  let targetJob = await Job.findById(targetJobId);
  if (targetJob.bidders.includes(currentUserId))
    throw new AppError(
      400,
      "User can only bid once per job",
      "Create Bid Error"
    );
  //Checking if user is bidding on their own jobs
  if (targetJob.lister.equals(currentUserId))
    throw new AppError(
      400,
      "User cannot bid on their own job listings",
      "Create Bid Error"
    );
  //Create bid after validation
  let bid = await Bid.create({
    bidder: currentUserId,
    targetJob: targetJobId,
    price,
  });
  //Adding current user to bidders list of target job
  targetJob.bidders.push(currentUserId);
  await calculateBidCount(targetJobId);
  await targetJob.save();
  //Response
  return sendResponse(res, 200, true, { bid }, null, "Create bid successfully");
});

bidController.acceptBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const bidId = req.params.id;
  //Business Logic Validation
  let bid = await Bid.findById(bidId).populate("bidder").populate("targetJob");
  if (!bid) throw new AppError(400, "Bid not found", "Accept Bid Error");

  let targetJob = await Job.findById(bid.toJSON().targetJob);
  if (!targetJob.lister.equals(currentUserId))
    throw new AppError(400, "Only lister can accept bid", "Accept Bid Error");

  //Process
  bid.status = "accepted";
  targetJob.assignee = bid.bidder;
  targetJob.status = "ongoing";
  await bid.save();
  await targetJob.save();

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

  const jobId = bid.toJSON().targetJob;
  await Bid.findOneAndDelete({ _id: bidId, bidder: currentUserId });

  await calculateBidCount(jobId);

  //Response
  return sendResponse(res, 200, true, { bid }, null, "Delete bid successfully");
});

module.exports = bidController;
