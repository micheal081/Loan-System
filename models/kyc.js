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
    bank_name: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    account_name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },
    account_number: {
      type: Number,
      required: [true, "Bank name is required"],
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
    },
    monthly_expenses: {
      type: Number,
      required: [true, "Monthly Expenses is required"],
      trim: true,
    },
    credit_score: {
      type: Number,
      required: [true, "Credit Score is required"],
      trim: true,
    },
    debt_to_income: {
      type: Number,
      required: [true, "Allowable Debt-to-income is required"],
      trim: true,
    },
    loan_to_value: {
      type: Number,
      required: [true, "Allowable Loan-to-value is required"],
      trim: true,
    },
    payment_to_income: {
      type: Number,
      required: [true, "Allowable Loan payment-to-income is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Kyc", KycSchema);
