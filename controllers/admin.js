// HTTP
const https = require("https");
const axios = require("axios");
// Admin model
const Admin = require("../models/admin");
// User mdoel
const User = require("../models/users");
// Know Your Customer model
const KycData = require("../models/kycData");
// Loan Application model
const LoanApplication = require("../models/loanApplication");
// Loan Disbursement model
const Disburse = require("../models/disburse");
// Loan Status model
const LoanStatus = require("../models/loanStatus");
// Loan History model
const LoanHistory = require("../models/loanHistory");
// Loan Repayment History model
const LoanRepaymentHistory = require("../models/loanRepayHistory");
// User Verification Model
const UserVerify = require("../models/userVerification");
// Reset Password Model
const ResetPassword = require("../models/resetPassword");
// Payment Records API
const PayRecord = require("../models/payRecord");
// Password handler
const bcrypt = require("bcrypt");
// unique string
const { v4: uuidv4 } = require("uuid");
// Async Wrapper middleware
const asyncWrapper = require("../middleware/async");
// Send Verification Link
const sendVerificationLink = require("../middleware/verifyEmail");
// Send Reset Password Link
const sendPasswordResetLink = require("../middleware/resetPassword");
// isAuthenticated Middleware
const isAuthenticated = require("../middleware/isAuthenticated");
// Response Data Middleware
const formatData = require("../middleware/responseData");
// Nodemailer packagae
const nodemailer = require("nodemailer");
// Dotenv file
require("dotenv").config();
// Initialize Paystack Payment API
const { initializeTransaction } = require("../middleware/paystack");
// Custom Error middleware
const { createCustomError } = require("../errors/custom-error");
// An rray of Banks and their codes
const banks = require("../middleware/banks");

// Admin Registration
const adminregister = asyncWrapper(async (req, res) => {
  Admin.findOne({ username: req.body.username })
    .then((adminData) => {
      if (
        !adminData ||
        typeof adminData == "null" ||
        typeof adminData == "undefined"
      ) {
        bcrypt
          .hash(req.body.password, 10)
          .then((hashedPassword) => {
            req.body.password = hashedPassword;
            const admin = new Admin(req.body);
            admin
              .save()
              .then((newAdminData) => {
                res.status(201).json({
                  msg: "Admin registered successfully. Kindly wait for approval!",
                  data: newAdminData,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong while saving admin data.",
                });
              });
          })
          .catch((err) => {
            res
              .status(500)
              .json({ msg: "Something went wrong while hashing password." });
          });
      } else {
        if (!adminData.approved) {
          res.status(200).json({
            msg: "This admin already exist. Kindly wait for approval!",
          });
        } else {
          res.status(200).json({ msg: "This admin already exist." });
        }
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ msg: "Something went wrong while finding admin." });
    });
});

// Admin Login API
const adminlogin = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  Admin.findOne({ username: username })
    .then((adminData) => {
      if (
        !adminData ||
        typeof adminData == "null" ||
        typeof adminData == "undefined"
      ) {
        res.status(200).json({ msg: "Incorrect credentials." });
      } else {
        if (adminData.approved) {
          bcrypt
            .compare(password, adminData.password)
            .then((validatedData) => {
              req.session.adminId = adminData._id;
              req.session.isAuth = true;
              res
                .status(201)
                .json({ msg: "Login successful", data: adminData });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Something went wrong while validating admin password.",
              });
            });
        } else {
          res
            .status(200)
            .json({ msg: "You have not been approved as an admin." });
        }
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ msg: "Something went wrong while finding admin data" });
    });
});

// List all admin data
const alladmin = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const adminId = req.session.adminId;
    Admin.findById(adminId)
      .then((adminData) => {
        if (
          !adminData ||
          typeof adminData == "null" ||
          typeof adminData == "undefined"
        ) {
          res.status(200).json({ msg: "Unauthorized user!" });
        } else {
          Admin.find({})
            .then((allAdmin) => {
              res.status(201).json({ data: allAdmin });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Something went wrong while fetching all admins.",
              });
            });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Something went wrong while finding admin data." });
      });
  } else {
    res.status(200).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// Approve Admin API
const approveadmin = asyncWrapper(async (req, res) => {
  const { adminIdParam } = req.params;
  if (req.session.isAuth) {
    const adminId = req.session.adminId;
    Admin.findById(adminId)
      .then((adminData) => {
        if (
          !adminData ||
          typeof adminData == "null" ||
          typeof adminData == "undefined"
        ) {
          res.status(200).json({ msg: "Unauthorized admin!" });
        } else {
          if (adminData.master) {
            Admin.findByIdAndUpdate(adminIdParam, { approved: true })
              .then((updatedAdminData) => {
                res.status(201).json({
                  msg: "Admin has been approved.",
                  data: updatedAdminData,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong while updating admin data",
                });
              });
          } else {
            res
              .status(200)
              .json({ msg: "Error! You can't approve other admin. " });
          }
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Something went wrong while finding admin data." });
      });
  } else {
    res.status(200).json({ msg: "Unauthorized user. Please log in again" });
  }
});

// Delete Admin API
const deleteadmin = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const { adminIdParam } = req.params;
    const adminId = req.session.adminId;
    Admin.findById(adminId)
      .then((adminData) => {
        if (adminData.master) {
          Admin.findByIdAndDelete(adminIdParam)
            .then(() => {
              res.status(200).json({ msg: "Admin deleted successfully." });
            })
            .catch((err) => {
              res
                .status(500)
                .json({
                  err: err,
                  msg: "Something went wrong while deleting admin.",
                });
            });
        } else {
          res.status(403).json({ msg: "Unauthorized admin." });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Something went wrong while finding admin data." });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// Get all Loan Application API
const allloanapplication = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    LoanApplication.find({})
      .then((loanData) => {
        if (
          !loanData ||
          loanData.length < 1 ||
          typeof loanData == "undefined" ||
          typeof loanData == "null"
        ) {
          res.status(204).json({ msg: "No loan application at the moment" });
        } else {
          res.status(200).json({ data: loanData });
        }
      })
      .catch((err) => {
        res.status(500).json({
          msg: "Something went wrong while fetching loan applications",
        });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again" });
  }
});

// Funds disbursement API
const disburse = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const adminId = req.session.adminId;
    const { loanId } = req.params;
    LoanApplication.findById({ _id: loanId })
      .then((loanData) => {
        if (loanData.approved) {
          res
            .status(200)
            .json({ msg: "Repeated action, loan has been approved!" });
        } else {
          KycData.findOne({ userId: loanData.userId })
            .then((kycData) => {
              // Paystack API for transferring funds to the user works only for non-starter business
              // error message received : You cannot initiate third party payouts as a starter business
              // const params = JSON.stringify({
              //   source: "Loan FinTech",
              //   reason: "Loan application",
              //   amount: loanData.loan_amount,
              //   recipient: {
              //     type: "nuban",
              //     name: kycData.bank_name,
              //     account_number: kycData.account_number,
              //     bank_code: kycData.bank_code,
              //   },
              // });

              // const options = {
              //   hostname: "api.paystack.co",
              //   port: 443,
              //   path: "/transfer",
              //   method: "POST",
              //   headers: {
              //     Authorization: `Bearer process.env.PAYSTACK_SECRET_KEY`,
              //     "Content-Type": "application/json",
              //   },
              // };

              // const reqTransfer = https
              //   .request(options, (resTransfer) => {
              //     let data = "";

              //     resTransfer.on("data", (chunk) => {
              //       data += chunk;
              //     });

              //     resTransfer.on("end", () => {
              //       const transferSuccess = JSON.parse(data);
              //       console.log(transferSuccess);
              LoanApplication.findByIdAndUpdate(
                { _id: loanId },
                { approved: true, application_status: "completed" }
              )
                .then((data) => {
                  const newDisburse = new Disburse({
                    userId: loanData.userId,
                    loan_amount: loanData.loan_amount,
                    account_number: kycData.account_number,
                    bank_name: kycData.bank_name,
                    disbursed: true,
                  });

                  newDisburse
                    .save()
                    .then((disburseData) => {
                      res.status(200).json({
                        msg: "Loan has been approved and sent to the user",
                        data: disburseData,
                      });
                    })
                    .catch((err) => {
                      res.status(500).json({
                        err: err,
                        msg: "Something went wrong while saving disburse records.",
                      });
                    });
                })
                .catch((err) => {
                  res.status(500).json({
                    msg: "Something went wrong while updating loan application",
                  });
                });
              //     });
              //   })
              //   .on("error", (error) => {
              //     console.error(error);
              //   });

              // reqTransfer.write(params);
              // reqTransfer.end();
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Something went wrong while searching for User kyc data",
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          msg: "Something went wrong while searching for loan application",
        });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again" });
  }
});

// Admin dashboard API
const admindashboard = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    User.find({})
      .then((user) => {
        Admin.find({})
          .then((admin) => {
            PayRecord.find({})
              .then((payRecord) => {
                LoanApplication.find({})
                  .then((loanApplication) => {
                    KycData.find({})
                      .then((kycData) => {
                        res
                          .status(200)
                          .json(
                            user,
                            admin,
                            payRecord,
                            loanApplication,
                            kycData
                          );
                      })
                      .catch((err) => {
                        res.status(500).json({
                          msg: "Something went wrong while finding kyc data.",
                        });
                      });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      msg: "Something went wrong while finding loan applications.",
                    });
                  });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong while finding payment records.",
                });
              });
          })
          .catch((err) => {
            res
              .status(500)
              .json({ msg: "Something went wrong while finding admins." });
          });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Something went wrong while finding users." });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

module.exports = {
  adminregister,
  adminlogin,
  alladmin,
  approveadmin,
  disburse,
  allloanapplication,
  admindashboard,
  deleteadmin,
};
