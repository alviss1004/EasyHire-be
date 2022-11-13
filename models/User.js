const mongoose = require("mongoose");
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

    isDeleted: { type: Boolean, default: false, select: false },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const User = mongoose.model("User", userSchema);
module.exports = User;
