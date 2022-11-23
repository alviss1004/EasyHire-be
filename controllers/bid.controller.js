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
//Calculate highest bid on a job
const calculateHighestBid = async (jobId) => {
  const job = await Job.findById(jobId).populate("bids");
  const jobBids = job.bids.map((bid) => bid.price);
  const highestBid = Math.max(...jobBids);
  await Job.findByIdAndUpdate(jobId, { highestBid });
};
//Calculate average bid on a job
const calculateAverageBid = async (jobId) => {
  const job = await Job.findById(jobId).populate("bids");
  const jobBids = job.bids.map((bid) => bid.price);
  let averageBid = 0;
  if (jobBids.length !== 0) {
    averageBid = jobBids.reduce((a, b) => a + b, 0) / jobBids.length;
  }
  await Job.findByIdAndUpdate(jobId, { averageBid });
};

bidController.createBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const { price } = req.body;
  const currentUserId = req.userId;
  const targetJobId = req.params.jobId;
  //Checking if bid price is negative
  if (price < 0)
    throw new AppError(
      400,
      "Bid price cannot be lower than 0",
      "Create Bid Error"
    );
  //Checking if user already had a bid on this job
  let targetJob = await Job.findById(targetJobId);
  if (targetJob.toJSON().bidders.includes(currentUserId))
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
  //Checking if user is bidding on an ongoing/finished job
  if (targetJob.status === "ongoing" || targetJob.status === "finished")
    throw new AppError(
      400,
      "User cannot bid on ongoing or finished jobs",
      "Create Bid Error"
    );
  //Create bid after validation
  let bid = await Bid.create({
    bidder: currentUserId,
    targetJob: targetJobId,
    price,
  });
  //Adding current user to bidders list of target job
  targetJob.bids.push(bid._id);
  targetJob.bidders.push(currentUserId);
  await calculateBidCount(targetJobId);
  await targetJob.save();
  //Calculate new highest bid and average bid
  await calculateHighestBid(targetJobId);
  await calculateAverageBid(targetJobId);
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

  let targetJob = await Job.findById(bid.targetJob._id);
  if (!targetJob.lister.equals(currentUserId))
    throw new AppError(400, "Only lister can accept bid", "Accept Bid Error");

  //Process
  bid.status = "accepted";
  targetJob.assignee = bid.bidder._id;
  targetJob.status = "ongoing";
  //Delete all other bids on the job
  targetJob.bids = bid._id;
  targetJob.bidders = bid.bidder._id;
  await Bid.deleteMany({ targetJob: targetJob._id, _id: { $ne: bidId } });

  await bid.save();
  await targetJob.save();

  //Response
  return sendResponse(res, 200, true, { bid }, null, "Accept bid successfully");
});

bidController.declineBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const bidId = req.params.id;
  //Business Logic Validation
  let bid = await Bid.findById(bidId).populate("targetJob");

  if (!bid) throw new AppError(400, "Bid not found", "Delete Bid Error");
  if (!bid.targetJob.lister.equals(currentUserId))
    throw new AppError(400, "User is not authorized", "Delete Bid Error");
  //Process
  await Bid.findOneAndDelete({ _id: bidId });
  //Also Removing bid from job's fields and calculate their new values
  const job = await Job.findById(bid.targetJob._id);
  const jobBids = job.bids;

  job.bids = jobBids.filter((bid) => !bid.equals(bidId));
  const jobBidders = job.bidders;
  job.bidders = jobBidders.filter((bidder) => !bidder.equals(bid.bidder));
  await job.save();
  await calculateBidCount(job._id);
  await calculateHighestBid(job._id);
  await calculateAverageBid(job._id);

  //Response
  return sendResponse(res, 200, true, { bid }, null, "Delete bid successfully");
});

bidController.deleteBid = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const bidId = req.params.id;
  //Business Logic Validation
  let bid = await Bid.findOne({ _id: bidId, bidder: currentUserId }).populate(
    "targetJob"
  );

  if (!bid)
    throw new AppError(
      400,
      "Bid not found or User is not authorized",
      "Delete Bid Error"
    );
  //Process
  await Bid.findOneAndDelete({ _id: bidId, bidder: currentUserId });
  //Removing bid from job and calculate new fields
  const job = await Job.findById(bid.targetJob._id);
  const jobBids = job.bids;

  job.bids = jobBids.filter((bid) => !bid.equals(bidId));
  const jobBidders = job.bidders;
  job.bidders = jobBidders.filter((bidder) => !bidder.equals(currentUserId));
  await job.save();
  await calculateBidCount(job._id);
  await calculateHighestBid(job._id);
  await calculateAverageBid(job._id);

  //Response
  return sendResponse(res, 200, true, { bid }, null, "Delete bid successfully");
});

module.exports = bidController;
