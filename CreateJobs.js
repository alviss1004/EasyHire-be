const User = require("./models/User");
const Job = require("./models/Job");
const mongoose = require("mongoose");
var { faker } = require("@faker-js/faker");

/*Code to generate new random jobs for frontend testing purposes*/

const industries = [
  "Arts & Entertainment",
  "Accommodation & Food Services",
  "Architecture & Design",
  "Business & Finance",
  "Educational Services",
  "Engineering",
  "Healthcare & Social Assistance",
  "Manufacturing",
  "Music & Audio",
  "Programming & Technology",
];

const calculateJobListingCount = async (userId) => {
  const jobListingCount = await Job.countDocuments({
    lister: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { jobListingCount });
};

const createJobs = async (numberOfJob) => {
  const userIds = await User.find({ isDeleted: false }, { _id: 1 }).distinct(
    "_id"
  );
  for (let i = 0; i < numberOfJob; i++) {
    const singleJob = {
      lister: userIds[Math.floor(Math.random() * 100)],
      industry: industries[Math.floor(Math.random() * 9)],
      title: faker.name.jobType(),
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    };
    await calculateJobListingCount(singleJob.lister);

    await Job.create(singleJob);
  }
};
createJobs(200);
