const mongoose = require("mongoose");

const LoanApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    application_status: {
      type: String,
      trim: true,
    },
    loan_amount: {
      type: String,
      required: [true, "Loan amount is required"],
      trim: true,
    },
    loan_total_amount: {
      type: String,
      required: [true, "Loan total amount is required"],
      trim: true,
    },
    repay_interval: {
      type: String,
      required: [true, "Repayment interval is required"],
      enum: ["3 days", "7 days", "2 weeks", "1 month"],
    },
    interest_rate: {
      type: String,
      required: [true, "Interest rate is required"],
      default: 5,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    repay_date: {
      type: Date,
      default: null
    },
    repayed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanApplication", LoanApplicationSchema);
