const mongoose = require("mongoose");

const LoanStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    eligible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanStatus", LoanStatusSchema);
