const mongoose = require("mongoose");

const ResetPasswordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  uniqueString: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now() + 900000,
  },
});

module.exports = mongoose.model("ResetPassword", ResetPasswordSchema);
