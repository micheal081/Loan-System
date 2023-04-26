const mongoose = require("mongoose");

const LoanHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    loan_amount: {
      type: Number,
      required: [true, "Loan amount is required"],
      trim: true,
    },
    eligible: {
      type: Boolean,
      required: true,
      default: false,
    },
    loan_approved_date: {
      type: Date,
      required: true,
    },
    loan_repayed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanHistory", LoanHistorySchema);
