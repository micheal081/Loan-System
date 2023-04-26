const mongoose = require("mongoose");

const LoanStatusSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanStatus", LoanStatusSchema);
