const mongoose = require("mongoose");
//Create schema
const bidSchema = mongoose.Schema(
  {
    bidder: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    targetJob: { type: mongoose.SchemaTypes.ObjectId, ref: "Job" },
    price: { type: Number, require: true },
    status: {
      type: String,
      enum: ["active", "accepted"],
      default: "active",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Bid = mongoose.model("Bid", bidSchema);
module.exports = Bid;
