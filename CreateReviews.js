const User = require("./models/User");
const Job = require("./models/Job");
const Review = require("./models/Review");
var { faker } = require("@faker-js/faker");

/*Code to generate new random reviews for frontend testing purposes*/

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

const createReviews = async (numberOfReview) => {
  const userIds = await User.find({ isDeleted: false }, { _id: 1 }).distinct(
    "_id"
  );
  const freelancerIds = await User.find(
    { isDeleted: false, isFreelancer: true },
    { _id: 1 }
  ).distinct("_id");
  const jobIds = await Job.find({ isDeleted: false }, { _id: 1 }).distinct(
    "_id"
  );
  for (let i = 0; i < numberOfReview; i++) {
    const singleReview = {
      author: userIds[Math.floor(Math.random() * 100)],
      targetJob: jobIds[Math.floor(Math.random() * 200)],
      rating: Math.floor(Math.random() * 5 + 1),
      comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    };
    let newReview = await Review.create(singleReview);
    let freelancer = await User.findById(
      freelancerIds[Math.floor(Math.random() * freelancerIds.length)]
    );
    calculateUserRating(freelancer._id, newReview.rating);
    freelancer.reviews.push(newReview._id);
    await freelancer.save();
  }
};
createReviews(400);
