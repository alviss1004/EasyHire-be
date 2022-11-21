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
const calculateHighestBid = async (jobId, newBid) => {
  const job = await Job.findById(jobId);
  if (job.highestBid === 0 || newBid > job.highestBid) {
    await Job.findByIdAndUpdate(jobId, { highestBid: newBid });
  }
};
//Calculate average bid on a job
const calculateAverageBid = async (jobId, newBid) => {
  const job = await Job.findById(jobId);
  if (job.averageBid === 0) {
    await Job.findByIdAndUpdate(jobId, { averageBid: newBid });
  } else {
    const averageBid =
      (job.averageBid * job.bids.length + newBid) / (job.bids.length + 1);
    await Job.findfindByIdAndUpdate(jobId, { averageBid });
  }
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
  //Calculate new highest bid and average bid
  calculateHighestBid(targetJobId, bid.price);
  calculateAverageBid(targetJobId, bid.price);
  //Adding current user to bidders list of target job
  targetJob.bids.push(bid);
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
