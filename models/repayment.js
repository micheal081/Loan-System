const mongoose = require("mongoose");

const RepaymentSchema = new mongoose.Schema(
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
    repayed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Repayment", RepaymentSchema);
