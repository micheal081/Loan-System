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
      type: Number,
      required: [true, "Loan amount is required"],
      trim: true,
    },
    approved: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanApplication", LoanApplicationSchema);
