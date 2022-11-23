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
  const averageBid = jobBids.reduce((a, b) => a + b, 0) / jobBids.length;
  await Job.findByIdAndUpdate(jobId, { averageBid });
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

    //Adding current user to bidders list of target job
    targetJob.bids.push(newBid._id);
    targetJob.bidders.push(newBid.bidder);
    await calculateBidCount(newBid.targetJob);
    await targetJob.save();
    await calculateHighestBid(newBid.targetJob);
    await calculateAverageBid(newBid.targetJob);
  }
};
createBids(400);
