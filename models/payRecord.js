const mongoose = require("mongoose");

const PayRecordSchema = new mongoose.Schema(
  {
    loan_id: {
      type: String,
      required: true,
    },
    reference_code: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PayRecord", PayRecordSchema);
