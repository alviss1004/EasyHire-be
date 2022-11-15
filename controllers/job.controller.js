const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const Job = require("../models/Job");
const User = require("../models/User");

const jobController = {};

const calculateJobListingCount = async (userId) => {
  const jobListingCount = await Job.countDocuments({
    lister: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { jobListingCount });
};

jobController.createJob = catchAsync(async (req, res, next) => {
  //Get data from request
  const { title, industry, description, skills, image } = req.body;
  const currentUserId = req.userId;
  //Business Logic Validation
  let job = await Job.create({
    lister: currentUserId,
    title,
    industry,
    description,
    skills,
    image,
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
  const filterConditions = [{ isDeleted: false }];
  if (filter.industry) {
    filterConditions.push({
      industry: { $regex: filter.industry, $options: "i" },
    });
  }
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Job.countDocuments(filterCriteria);
  const offset = limit * (page - 1);
  const totalPages = Math.ceil(count / limit);

  let jobs = await Job.find(filterCriteria)
    .sort({ createdAt: -1 })
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

jobController.getJobDetail = catchAsync(async (req, res, next) => {
  //Get data from request
  const jobId = req.params.id;
  //Business Logic Validation
  const job = await Job.findById(jobId);
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
  const job = await Job.findById(jobId);
  if (!job) throw new AppError(400, "Job not found", "Get Job Bids Error");

  const jobBids = job.bids;

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
  const allows = ["title", "industry", "description", "skills", "image"];
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
    { _id: postId, lister: currentUserId },
    { isDeleted: true },
    { new: true }
  );

  if (!job)
    throw new AppError(
      400,
      "Job not found or User is not authorized",
      "Delete Job Error"
    );
  await calculatePostCount(currentUserId);

  //Response
  return sendResponse(res, 200, true, { job }, null, "Delete job successfully");
});

module.exports = jobController;
