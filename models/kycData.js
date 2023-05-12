const mongoose = require("mongoose");

const KycSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    telephone: {
      type: String,
      required: [true, "Telephone is required"],
      trim: true,
    },
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middle_name: {
      type: String,
      required: [true, "Middle name is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    bank_name: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    bank_code: {
      type: String,
      required: true,
    },
    account_name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },
    account_number: {
      type: String,
      required: [true, "Account number is required"],
      trim: true,
    },
    bvn: {
      type: Number,
      required: [true, "Bank Verification Number is required"],
      trim: true,
    },
    monthly_income: {
      type: Number,
      required: [true, "Monthly Income is required"],
      trim: true,
      min: 0,
      max: 10000000,
    },
    monthly_expenses: {
      type: Number,
      required: [true, "Monthly Expenses is required"],
      trim: true,
      min: 0,
      max: 10000000,
    },
    credit_score: {
      type: Number,
      required: [true, "Credit Score is required"],
      trim: true,
      min: 300,
      max: 850,
    },
    debt_to_income: {
      type: Number,
      required: [true, "Allowable Debt-to-income is required"],
      trim: true,
      min: 0,
      max: 1,
    },
    loan_to_value: {
      type: Number,
      required: [true, "Allowable Loan-to-value is required"],
      trim: true,
      min: 0,
      max: 1,
    },
    payment_to_income: {
      type: Number,
      required: [true, "Allowable Loan payment-to-income is required"],
      trim: true,
      min: 0,
      max: 1,
    },
    kyc_approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Kyc", KycSchema);
