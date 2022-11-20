const User = require("./models/User");
const Job = require("./models/Job");
const Review = require("./models/Review");
var { faker } = require("@faker-js/faker");

/*Code to generate new random reviews for frontend testing purposes*/

const createReviews = async (numberOfReview) => {
  const userIds = await User.find({ isDeleted: false }, { _id: 1 }).distinct(
    "_id"
  );
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
    let user = await User.findById(userIds[Math.floor(Math.random() * 100)]);
    user.reviews.push(newReview._id);
    await user.save();
  }
};
createReviews(200);
