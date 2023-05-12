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
    approved: {
      status: {
        type: Boolean,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
    },
    loan_repayment_date: {
      type: Date,
      required: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanHistory", LoanHistorySchema);
