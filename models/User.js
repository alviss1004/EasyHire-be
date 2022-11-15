const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

//Create schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isFreelancer: { type: Boolean, default: false },

    avatarUrl: { type: String, required: false, default: "" },
    aboutMe: { type: String, required: false, default: "" },
    company: { type: String, required: false, default: "" },
    industry: { type: String, required: false, default: "" },
    skills: [{ type: String, required: false, default: "" }],

    bids: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Bid" }],

    isDeleted: { type: Boolean, default: false, select: false },
    jobListingCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

//Create and export model
const User = mongoose.model("User", userSchema);
module.exports = User;
