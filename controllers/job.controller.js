const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const Bid = require("../models/Bid");

const jobController = {};

//function to calculate new job listing count of user
const calculateJobListingCount = async (userId) => {
  const jobListingCount = await Job.countDocuments({
    lister: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { jobListingCount });
};

jobController.createJob = catchAsync(async (req, res, next) => {
  //Get data from request
  const { title, industry, description } = req.body;
  const currentUserId = req.userId;
  //Business Logic Validation
  let job = await Job.create({
    lister: currentUserId,
    title,
    industry,
    description,
  });
  await calculateJobListingCount(currentUserId);

  //Response
  return sendResponse(res, 200, true, { job }, null, "Create job successfully");
});

jobController.getJobs = catchAsync(async (req, res, next) => {
  //Get data from request
  let { page, limit, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  //Business Logic Validation & Process
  const filterConditions = [{ isDeleted: false, status: "bidding" }];
  //Check for filter by industry
  if (filter.industry && filter.industry !== "All") {
    filterConditions.push({
      industry: { $regex: filter.industry, $options: "i" },
    });
  }
  //Check for search query
  if (filter.search) {
    filterConditions.push({
      $or: [
        { title: { $regex: filter.search, $options: "i" } },
        { description: { $regex: filter.search, $options: "i" } },
      ],
    });
  }
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};
  //Check for value of sort and sort accordingly
  let sort;
  if (filter.sortBy === "newest" || filter.sortBy === "Newest") {
    sort = { createdAt: -1 };
  } else if (filter.sortBy === "highestBidAsc") {
    sort = { highestBid: 1 };
  } else if (filter.sortBy === "highestBidDesc") {
    sort = { highestBid: -1 };
  } else if (filter.sortBy === "averageBidAsc") {
    sort = { averageBid: 1 };
  } else {
    sort = { averageBid: -1 };
  }

  //Get jobs based on pagination
  const count = await Job.countDocuments(filterCriteria);
  const offset = limit * (page - 1);
  const totalPages = Math.ceil(count / limit);
  let jobs = await Job.find(filterCriteria)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate("lister");
  if (!jobs) throw new AppError(400, "No job found", "Get Jobs Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { jobs, totalPages, count },
    null,
    "Get jobs successfully"
  );
});

jobController.getLatestJobs = catchAsync(async (req, res, next) => {
  //Business Logic Validation & Process
  let jobs = await Job.find({ isDeleted: false, status: "bidding" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("lister");
  if (!jobs) throw new AppError(400, "No job found", "Get Latest Jobs Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { jobs },
    null,
    "Get latest jobs successfully"
  );
});

jobController.getJobDetail = catchAsync(async (req, res, next) => {
  //Get data from request
  const jobId = req.params.id;
  //Business Logic Validation
  const job = await Job.findById(jobId)
    .populate("lister")
    .populate({ path: "assignee", populate: { path: "reviews" } })
    .populate({ path: "bids", populate: { path: "bidder" } })
    .populate("review");
  if (!job) throw new AppError(400, "Job not found", "Get Job Detail Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { job },
    null,
    "Get job detail successfully"
  );
});

jobController.getJobBids = catchAsync(async (req, res, next) => {
  //Get data from request
  const jobId = req.params.id;
  //Business Logic Validation
  const jobBids = await Bid.find({ targetJob: jobId }).sort({ price: -1 });
  if (!jobBids) throw new AppError(400, "No bids found", "Get Job Bids Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    { jobBids },
    null,
    "Get job bids successfully"
  );
});

jobController.updateJob = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const jobId = req.params.id;
  //Business Logic Validation
  let job = await Job.findById(jobId);
  if (!job) throw new AppError(400, "Job not found", "Update Job Error");
  if (!job.lister.equals(currentUserId))
    throw new AppError(400, "Only lister can edit job", "Update Job Error");

  //Process
  const allows = ["title", "industry", "description", "image", "status"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });
  await job.save();
  //Response
  return sendResponse(res, 200, true, { job }, null, "Update job successfully");
});

jobController.deleteJob = catchAsync(async (req, res, next) => {
  //Get data from request
  const currentUserId = req.userId;
  const jobId = req.params.id;
  //Business Logic Validation
  let job = await Job.findOneAndUpdate(
    { _id: jobId, lister: currentUserId },
    { isDeleted: true },
    { new: true }
  );

  if (!job)
    throw new AppError(
      400,
      "Job not found or User is not authorized",
      "Delete Job Error"
    );

  //Delete all bids on deleted job
  await Bid.deleteMany({ targetJob: jobId });
  //Calculate new listing count on user
  await calculateJobListingCount(currentUserId);

  //Response
  return sendResponse(res, 200, true, { job }, null, "Delete job successfully");
});

module.exports = jobController;
