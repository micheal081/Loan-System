const mongoose = require("mongoose");

const DisburseSchema = new mongoose.Schema(
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
    account_number: {
      type: Number,
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
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Disburse", DisburseSchema);
