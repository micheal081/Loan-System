const mongoose = require("mongoose");

const DisburseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    loan_amount: {
      type: String,
      required: [true, "Loan amount is required"],
      trim: true,
    },
    account_number: {
      type: String,
      required: true,
      trim: true,
    },
    bank_name: {
      type: String,
      required: true,
      trim: true,
    },
    disbursed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Disburse", DisburseSchema);
