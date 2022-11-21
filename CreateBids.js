const User = require("./models/User");
const Job = require("./models/Job");
const Bid = require("./models/Bid");

/*Code to generate new random bids for frontend testing purposes*/

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
      (job.averageBid / job.bids.length + newBid) / (job.bids.length + 1);
    await Job.findByIdAndUpdate(jobId, { averageBid });
  }
};

const createBids = async (numberOfBid) => {
  const userIds = await User.find(
    { isDeleted: false, isFreelancer: true },
    { _id: 1 }
  ).distinct("_id");
  const jobIds = await Job.find({ isDeleted: false }, { _id: 1 }).distinct(
    "_id"
  );
  for (let i = 0; i < numberOfBid; i++) {
    const singleBid = {
      bidder: userIds[Math.floor(Math.random() * userIds.length)],
      targetJob: jobIds[Math.floor(Math.random() * 200)],
      price: Math.floor(Math.random() * 100),
    };
    let newBid = await Bid.create(singleBid);

    let targetJob = await Job.findById(newBid.targetJob);
    calculateHighestBid(newBid.targetJob, newBid.price);
    calculateAverageBid(newBid.targetJob, newBid.price);
    //Adding current user to bidders list of target job
    targetJob.bids.push(newBid);
    await calculateBidCount(newBid.targetJob);
    await targetJob.save();
  }
};
createBids(400);
