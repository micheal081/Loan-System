const mongoose = require("mongoose");

const LoanRepaymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    loan_id: {
      type: String,
      required: true
    },
    amount_paid: {
      type: String,
      trim: true,
    },
    reference_code: {
      type: String,
      required: true
    },
    repayment_date: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LoanRepaymentHistory",
  LoanRepaymentHistorySchema
);
