const mongoose = require("mongoose");
//Create schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isFreelancer: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
//Create and export model
const User = mongoose.model("User", userSchema);
module.exports = User;
