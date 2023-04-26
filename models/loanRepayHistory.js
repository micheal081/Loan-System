const mongoose = require("mongoose");

const LoanRepaymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    amount_paid: {
      type: Number,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LoanRepaymentHistory",
  LoanRepaymentHistorySchema
);
