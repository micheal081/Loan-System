// HTTP
const https = require("https");
const axios = require("axios");
// User mdoel
const User = require("../models/users");
// Know Your Customer model
const KycData = require("../models/kycData");
// Loan Application model
const LoanApplication = require("../models/loanApplication");
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

// render home page
const home = asyncWrapper(async (req, res) => {
  res.render("index");
});

// Create a transporter object
let transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS,
  },
});

// Send verification email
const sendVerificationEmail = ({ _id, email }, req, res) => {
  const currentUrl = "https://loansystem.onrender.com/api/v1/loan/";
  const uniqueString = uuidv4() + _id;
  const mailOptions = sendVerificationLink(
    email,
    _id,
    uniqueString,
    currentUrl
  );

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      //  create data in UserVerify collection
      const newVerification = new UserVerify({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              // Email sent and verification record saved
              // res.status(201).jFson({
              //   msg: "A verification link has been sent to your email. Please check your inbox",
              // });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Something went wrong. Verification link could not be sent",
              });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ msg: "Something went wrong." });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Something went wrong." });
    });
};

// Register API
const register = asyncWrapper(async (req, res) => {
  User.findOne({ email: { $eq: req.body.email } })
    .then((data) => {
      if (!data) {
        bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
          req.body.password = hashedPassword;
          const user = new User(req.body);
          user
            .save()
            .then((info) => {
              sendVerificationEmail(info, req, res);
              res.status(201).json({
                msg: "Registration successful",
                verification:
                  "A verification link has been sent to your email. Please check your inbox",
                user: info,
              });
            })
            .catch((err) => {
              console.log(err);
              res
                .status(500)
                .json({ msg: "Something went wrong. Could not save user!" });
            });
        });
      } else {
        const responseData = formatData(data);
        res
          .status(401)
          .json({ msg: "This user already exists", user: responseData });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Something went wrong finding user." });
    });
});

// Email verification API
const verify = asyncWrapper(async (req, res) => {
  let { userId, uniqueString } = req.params;

  UserVerify.findOne({ userId })
    .then((result) => {
      if (result) {
        //  user verification record exist
        const { expiresAt } = result;
        const hashedUniqueString = result.uniqueString;
        // Checks for expired unique string
        if (expiresAt < Date.now()) {
          // record has expired so we delete it
          UserVerify.deleteOne({ userId })
            .then((result) => {
              User.deleteOne({ _id: userId })
                .then(() => {
                  res.status(403).json({
                    msg: "Email verification link has expired. Please sign up again",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    msg: "Something went wrong. Could not delete user",
                  });
                });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                msg: "Something went wrong. Could not delete user verification data",
              });
            });
        } else {
          // valid record exists so we validate the user string
          // First compare the hashed unique string
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                //  strings match
                User.updateOne({ _id: userId }, { verified: true })
                  .then((data) => {
                    UserVerify.deleteOne({ userId })
                      .then(() => {
                        const responseData = formatData(data);
                        res.status(200).json({
                          msg: "User has been verified!",
                          user: responseData,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                          msg: "An error occured while finalizing user verification",
                        });
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                      msg: "An error occured while updating user data to display verified",
                    });
                  });
              } else {
                //  existing record but incorrect verification details passed.
                res.status(401).json({
                  msg: "Invalid email verification link. Check your inbox",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                msg: "An error occured while comparing unique strings.",
              });
            });
        }
      } else {
        //  user verification record doesn't exist
        res.status(403).json({
          msg: "User record doesn't exist or has been verified already. Please sign up or log in",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "An error occured while checking for existing user verification record",
      });
    });
});

// Resend Email verification link
const resendVerify = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  await User.findOne({ email: email })
    .then((data) => {
      if (data) {
        try {
          UserVerify.find({ userId: data._id })
            .then((result) => {
              if (
                !result ||
                result.length < 1 ||
                typeof result == undefined ||
                typeof result == null
              ) {
                res.status(201).json({
                  msg: `${email} has been verified. Proceed to login!`,
                });
              } else {
                UserVerify.deleteOne({ userId: data._id })
                  .then(() => {
                    sendVerificationEmail(data, req, res);
                    const responseData = formatData(data);
                    res.status(201).json({
                      verification:
                        "A verification link has been sent to your email. Please check your inbox",
                      user: responseData,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                      msg: "An error occured while finding user",
                    });
                  });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                msg: "An error occured while finding user",
              });
            });
        } catch (err) {
          console.log(err);
          res.status(500).json({
            msg: "An error occured while finding user",
          });
        }
      } else {
        res.status(403).json({
          msg: "User does not exist",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({
        msg: "User does not exist",
      });
    });
});

// Login API
const login = asyncWrapper(async (req, res) => {
  await User.findOne({
    $or: [
      { email: { $eq: req.body.email_username } },
      { username: { $eq: req.body.email_username } },
    ],
  })
    .then((data) => {
      if (data.verified) {
        bcrypt
          .compare(req.body.password, data.password)
          .then((result) => {
            if (result) {
              ResetPassword.find({
                $or: [
                  {
                    $and: [
                      { userId: data._id },
                      { expiresAt: { $lt: Date.now() } },
                    ],
                  },
                  {
                    $or: [
                      { userId: data._id },
                      { expiresAt: { $lt: Date.now() } },
                    ],
                  },
                ],
              })
                .then((info) => {
                  if (
                    !info ||
                    info.length < 1 ||
                    typeof info == undefined ||
                    typeof info == null
                  ) {
                    req.session.userId = data._id;
                    req.session.isAuth = true;
                    const responseData = formatData(data);
                    res
                      .status(200)
                      .json({ msg: "Login successful", user: responseData });
                  } else {
                    ResetPassword.findOneAndDelete({ userId: info[0].userId })
                      .then(() => {
                        req.session.userId = data._id;
                        req.session.isAuth = true;
                        const responseData = formatData(data);
                        res.status(200).json({
                          msg: "Login successful",
                          user: responseData,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                          msg: "Something went wrong while deleting user verification data",
                        });
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    msg: "Something went wrong while finding user verification data",
                  });
                });
            } else {
              res.status(401).json({ msg: "Incorrect details" });
            }
          })
          .catch((err) => {
            res.status(500).json({
              msg: "Something went wrong while validating user password.",
            });
          });
      } else {
        res.status(403).json({ msg: "User account has not been verified." });
      }
    })
    .catch((err) =>
      res.status(500).json({ msg: "Something went wrong finding user." })
    );
});

// Forget Password API
const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  User.findOne({ email: email })
    .then((data) => {
      if (
        !data ||
        data.length < 1 ||
        typeof data == undefined ||
        typeof data == null
      ) {
        res.status(403).json({
          msg: `${email} does not exist. Proceed to Signup!`,
        });
      } else {
        // Handles password reset
        console.log(data);
        sendPasswordLink(data, req, res);
        res.status(201).json({
          msg: "Password reset link sent. Please check your inbox!",
          user: data,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "An error occured while finding user",
      });
    });
});

// Send Reset Password Link
const sendPasswordLink = ({ _id, email }, req, res) => {
  const currentUrl =
    "https://loansystem.onrender.com/api/v1/loan/viewresetpasswordpage";
  const uniqueString = uuidv4() + _id;
  const mailOptions = sendPasswordResetLink(
    email,
    _id,
    uniqueString,
    currentUrl
  );

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      //  create data in UserVerify collection
      const newPassAccess = new ResetPassword({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 900000,
      });

      newPassAccess
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              // Email sent and verification record saved
              // res.status(201).json({
              //   msg: "A verification link has been sent to your email. Please check your inbox",
              // });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Something went wrong. Reset Password link could not be sent",
              });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ msg: "Something went wrong." });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Something went wrong." });
    });
};

// View password reset page
const viewResetPasswordPage = asyncWrapper(async (req, res) => {
  const currentUrl =
    "https://loansystem.onrender.com/api/v1/loan/changepassword";
  let { userId, uniqueString } = req.params;
  res.status(201).json({
    msg: "Password has been reset. Follow this URL to input your new password",
    url: `${currentUrl}/${userId}/${uniqueString}`,
  });
});

// Reset Password
const changePassword = asyncWrapper(async (req, res) => {
  const { password } = req.body;
  let { userId, uniqueString } = req.params;

  ResetPassword.findOne({ userId })
    .then((result) => {
      if (result) {
        //  user reset password record exist
        const { expiresAt } = result;
        const hashedUniqueString = result.uniqueString;
        // Checks for expired unique string
        if (expiresAt < Date.now()) {
          // record has expired so we delete it
          ResetPassword.deleteOne({ userId })
            .then((result) => {
              res.status(403).json({
                msg: "Password reset link has expired",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                msg: "Something went wrong. Could not delete user reset password data",
              });
            });
        } else {
          // valid record exists so we validate the user string
          // First compare the hashed unique string
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                //  strings match
                User.updateOne({ _id: userId }, { password: password })
                  .then(() => {
                    ResetPassword.deleteOne({ userId })
                      .then((data) => {
                        const responseData = formatData(data);
                        res.status(200).json({
                          msg: "Password reset successful!",
                          user: responseData,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                          msg: "An error occured while finalizing password reset",
                        });
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                      msg: "An error occured while updating user data to display verified",
                    });
                  });
              } else {
                //  existing record but incorrect verification details passed.
                res.status(404).json({
                  msg: "Invalid password reset link. Check your inbox!",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                msg: "An error occured while comparing unique strings.",
              });
            });
        }
      } else {
        //  user verification record doesn't exist
        res.status(403).json({
          msg: "User has not requested for a change of password.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "An error occured while checking for existing user reset password record",
      });
    });
});

// Dashboard API
const dashboard = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const userId = req.session.userId;
    LoanApplication.find({ userId: userId })
      .then((loanApplication) => {
        if (
          !loanApplication ||
          loanApplication.length < 1 ||
          typeof loanApplication == "null" ||
          typeof loanApplication == "undefined"
        ) {
          res.status(204).json({ msg: "No loan application at the moment" });
        } else {
          LoanHistory.find({ userId: userId })
            .then((loanHistory) => {
              if (
                !loanHistory ||
                loanHistory.length < 1 ||
                typeof loanHistory == "undefined" ||
                typeof loanHistory == "null"
              ) {
                res
                  .status(204)
                  .json({ msg: "No loan histories found for this user." });
              } else {
                LoanStatus.findOne({ userId: userId })
                  .then((loanStatus) => {
                    if (
                      !loanStatus ||
                      loanStatus.length < 1 ||
                      typeof loanStatus == "undefined" ||
                      typeof loanStatus == "null"
                    ) {
                      res
                        .status(204)
                        .json({ msg: "No loan status found for this user." });
                    } else {
                      PayRecord.find({ userId: userId })
                        .then((payRecord) => {
                          if (
                            !payRecord ||
                            payRecord.length < 1 ||
                            typeof payRecord == "null" ||
                            typeof payRecord == "undefined"
                          ) {
                            res.status(204).json({
                              msg: "No payment record for this user at this time.",
                            });
                          } else {
                            res
                              .status(200)
                              .json(
                                loanApplication,
                                loanHistory,
                                loanStatus,
                                payRecord
                              );
                          }
                        })
                        .catch((err) => {
                          res.status(500).json({
                            msg: "Something went wrong while getting all payment records for this user.",
                          });
                        });
                    }
                  })
                  .catch((err) => {
                    res.status(500).json({
                      msg: "Something went wrong while getting the loan status for this user. ",
                    });
                  });
              }
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Something went wrong while finding loan histories for this user",
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          msg: "Something went wrong while finding loan applications for this user.",
        });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// KYC Data API
const kycdata = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const userId = req.session.userId;
    User.findOne({ _id: userId })
      .then((result) => {
        KycData.find({ userId: result._id })
          .then((info) => {
            if (
              !info ||
              info.length < 1 ||
              typeof info == undefined ||
              typeof info == null
            ) {
              const {
                bvn,
                account_number,
                bank_name,
                first_name,
                last_name,
                middle_name,
              } = req.body;
              const bankName = bank_name; // replace with the name of the bank you're looking for
              const bank = banks.find((b) => b.name === bankName);
              if (bank) {
                const bankCode = bank.code;
                const params = JSON.stringify({
                  bvn: bvn,
                  account_number: account_number,
                  bank_code: bankCode,
                  first_name: first_name,
                  last_name: last_name,
                  middle_name: middle_name,
                });

                const options = {
                  hostname: "api.paystack.co",
                  port: 443,
                  path: "/bvn/match",
                  method: "POST",
                  headers: {
                    Authorization:
                      `Bearer process.env.PAYSTACK_SECRET_KEY`,
                    "Content-Type": "application/json",
                  },
                };

                const reqVerify = https
                  .request(options, (resVerify) => {
                    let data = "";

                    resVerify.on("data", (chunk) => {
                      data += chunk;
                    });

                    resVerify.on("end", () => {
                      const validated = JSON.parse(data);
                      console.log(validated);
                      if (
                        validated.status &&
                        validated.data.account_number &&
                        validated.data.first_name &&
                        validated.data.last_name
                      ) {
                        const customData = {
                          userId: result._id,
                          email: result.email,
                          telephone: result.telephone,
                          bank_code: bankCode,
                          kyc_approved: true,
                        };
                        const kyc = new KycData({
                          ...customData,
                          ...req.body,
                        });
                        kyc
                          .save()
                          .then((data) => {
                            const newStatus = new LoanStatus({
                              userId: userId,
                              eligible: true,
                            });
                            newStatus
                              .save()
                              .then((info) => {
                                res.status(200).json({
                                  msg: "KYC approved!",
                                  KYC: data,
                                  loanStatus: info,
                                });
                              })
                              .catch((err) => {
                                res.status(500).json({
                                  msg: "Something went wrong while update loan status",
                                });
                              });
                          })
                          .catch((err) => {
                            console.log(err);
                            res.status(500).json({
                              msg: "Something went wrong while saving kyc data",
                            });
                          });
                      } else {
                        res.status(401).json({
                          msg: "Incorrect details. Please try again.",
                        });
                      }
                    });
                  })
                  .on("error", (error) => {
                    console.error(error);
                    res.status(500).json({ err: error });
                  });

                reqVerify.write(params);
                reqVerify.end();
              } else {
                console.log(
                  `Sorry, we couldn't find a bank with the name ${bankName}.`
                );
                res.status(403).json({
                  msg: `Sorry, we couldn't find a bank with the name ${bankName}.`,
                });
              }
            } else {
              res.status(204).json({
                msg: "KYC registration already approved.",
              });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              msg: "Something went wrong while finding KYC data for this user",
            });
          });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Something went wrong while searching for user" });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// Initialize payment API
const payment = asyncWrapper(async (req, res) => {
  const { email, amount } = req.body;
  initializeTransaction(email, amount)
    .then((response) => {
      res.status(201).json(response);
    })
    .catch((error) => {
      res.status(500).json({ err: error });
    });
});

// Verify payment
const verifypayment = asyncWrapper(async (req, res) => {
  const event = req.body.event;
  const trxref = req.query.trxref;
  const reference = req.query.reference;
  if (event === "charge.success") {
    const paymentReference = req.body.data.reference;
    // Verify payment status with Paystack API
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer process.env.PAYSTACK_SECRET_KEY`,
        },
      }
    );
    const paymentStatus = paystackResponse.data.data.status;
    if (paymentStatus === "success") {
      PayRecord.findOne({ reference_code: reference })
        .then((payRecordData) => {
          if (payRecordData.purpose == "LOAN REPAYMENT") {
            const newRepaymentHistory = new LoanRepaymentHistory({
              userId: payRecordData.userId,
              loan_id: payRecordData.loan_Id,
              amount_paid: payRecordData.amount,
              repayment_date: Date.now(),
            });

            newRepaymentHistory
              .save()
              .then((repayHistory) => {
                LoanApplication.updateOne(
                  { userId: payRecordData.userId },
                  { repayed: true, repay_date: Date.now() }
                )
                  .then((loanData) => {
                    res.redirect(
                      "https://loansystem.onrender.com/api/v1/loan/"
                    );
                  })
                  .catch((err) => {
                    res.status(500).json({
                      msg: "Something went wrong while updating loan application",
                    });
                  });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong while saving new repayment data",
                });
              });
          }
        })
        .catch((err) => {
          res.status(500).json({
            msg: "Something went wrong while finding payment record.",
          });
        });
    } else {
      res.redirect("https://loansystem.onrender.com/api/v1/loan/");
    }
  } else {
    res.redirect("https://loansystem.onrender.com/api/v1/loan/");
  }
});

// Loan Application API
const loanapplication = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const userId = req.session.userId;
    const kycdata = await KycData.findOne({ userId: userId });
    if (!kycdata || typeof kycdata == "undefined" || typeof kycdata == "null") {
      res.status(204).json({ msg: "No KYC data for this User" });
    } else {
      const loanstat = await LoanStatus.findOne({ userId: userId });
      if (
        !loanstat ||
        typeof loanstat == "undefined" ||
        typeof loanstat == "null"
      ) {
        res.status(204).json({
          msg: "An error has occurred. No loan status found for this user.",
        });
      } else {
        if (loanstat.eligible) {
          const I = kycdata.monthly_income;
          const E = kycdata.monthly_expenses;
          const C = kycdata.credit_score;
          const D = kycdata.debt_to_income;
          const L = kycdata.loan_to_value;
          const P = kycdata.payment_to_income;

          const M = I * D - E;
          const S = I * P;
          const V = (I * L) / 12;

          const min = Math.min(M, S, V);
          const A = min * (C / 700);

          //
          const { loan_amount, repay_interval } = req.body;

          // Check if user has an existing loan application
          const existingLoan = await LoanApplication.findOne({
            $or: [
              { $and: [{ userId: userId }, { application_status: "pending" }] },
              {
                $and: [{ userId: userId }, { application_status: "completed" }],
              },
            ],
          });

          if (!existingLoan.repayed) {
            return res
              .status(200)
              .json({ msg: "You already have a pending loan application" });
          } else {
            if (loan_amount < 2000) {
              res
                .status(200)
                .json({ msg: "The loan amount is below the limit" });
            } else if (loan_amount > A) {
              res
                .status(200)
                .json({ msg: "The loan amount has exceeded the limit" });
            } else {
              // Calculate interest rate
              let interestRate = 5;
              switch (repay_interval) {
                case "3 days":
                  interestRate = 5;
                  break;
                case "7 days":
                  interestRate = 10;
                  break;
                case "2 weeks":
                  interestRate = 15;
                  break;
                case "1 month":
                  interestRate = 18;
                  break;
                default:
                  interestRate = 5;
              }

              // Calculate total amount to be paid back
              const loan_amount1 = parseInt(loan_amount);
              const interest = (interestRate / 100) * loan_amount1;
              const totalAmount = loan_amount1 + interest;

              const repayIntervalInMs = {
                "3 days": 3 * 24 * 60 * 60 * 1000,
                "7 days": 7 * 24 * 60 * 60 * 1000,
                "2 weeks": 14 * 24 * 60 * 60 * 1000,
                "1 month": 30 * 24 * 60 * 60 * 1000,
              }[repay_interval];

              const repayDate = new Date(Date.now() + repayIntervalInMs);

              // Create new loan application object
              const newLoan = new LoanApplication({
                userId: userId,
                application_status: "pending",
                loan_amount: loan_amount,
                loan_total_amount: totalAmount,
                repay_interval: repay_interval,
                interest_rate: `${interestRate}%`,
                repay_date: repayDate,
              });

              // Save loan application to database
              newLoan
                .save()
                .then((data) => {
                  LoanStatus.updateOne({ userId: userId }, { eligible: false })
                    .then((info) => {
                      const newHistory = new LoanHistory({
                        userId: userId,
                        loan_amount: totalAmount,
                        approved: {
                          status: false,
                          date: new Date(),
                        },
                        loan_repayment_date: repayDate,
                      });

                      newHistory
                        .save()
                        .then((hisData) => {
                          res.status(200).json({
                            msg: "Loan application submitted successfylly. Kindly wait for approval",
                            loan_Application: data,
                            loan_Status: info,
                            loan_History: hisData,
                          });
                        })
                        .catch((err) => {
                          res.status(500).json({
                            err: err,
                            msg: "Something went wrong while saving history for this user",
                          });
                        });
                    })
                    .catch((err) => {
                      res.status(500).json({
                        msg: "Something went wrong while updating loan status",
                      });
                    });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    msg: "Something went wrong with saving the loan application",
                  });
                });
            }
          }
        } else {
          res.status(403).json({
            msg: "You are ineligible for a loan at this moment until you repay the previous loan.",
          });
        }
      }
    }
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// Loan Status API
const loanstatus = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const userId = req.session.userId;
    LoanStatus.findOne({ userId: userId })
      .then((data) => {
        if (
          !data ||
          data.length < 1 ||
          typeof data == "undefined" ||
          typeof data == "null"
        ) {
          res.status(204).json({ msg: "No loan status found for this user." });
        } else {
          res
            .status(200)
            .json({ msg: "Loan status found for this user.", data: data });
        }
      })
      .catch((err) => {
        res.status(500).json({
          msg: "Something went wrong while getting the loan status for this user. ",
        });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// Loan History API
const loanhistory = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const userId = req.session.userId;
    LoanHistory.find({ userId: userId })
      .then((loanData) => {
        if (
          !loanData ||
          loanData.length < 1 ||
          typeof loanData == "undefined" ||
          typeof loanData == "null"
        ) {
          res
            .status(204)
            .json({ msg: "No loan histories found for this user." });
        } else {
          res
            .status(200)
            .json({ msg: "Loan histories found!", data: loanData });
        }
      })
      .catch((err) => {
        res.status(500).json({
          msg: "Something went wrong while finding loan histories for this user",
        });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again" });
  }
});

// Repayment API
const repayment = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const { userId } = req.session.userId;
    const { loanId } = req.params;
    LoanApplication.findOne({ _id: loanId })
      .then((loanData) => {
        KycData.findOne({ userId: loanData.userId })
          .then((kycData) => {
            const email = kycData.email;
            const amount = loanData.loan_total_amount;
            initializeTransaction(email, amount)
              .then((response) => {
                const url = response.data.authorization_url;
                const reference_code = response.data.reference;

                const newPayRecord = new PayRecord({
                  loan_id: loanId,
                  reference_code: reference_code,
                  userId: loanData.userId,
                  amount: amount,
                  purpose: "LOAN REPAYMENT",
                });

                newPayRecord
                  .save()
                  .then((repayData) => {
                    res.status(200).json({
                      msg: "New payment record saved!",
                      data: repayData,
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      msg: "Something went wrong while saving new payment records",
                    });
                  });
              })
              .catch((error) => {
                res.status(500).json({ err: error });
              });
          })
          .catch((err) => {
            res.status(500).json({
              msg: "Something went wrong while finding the user kyc data",
            });
          });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Something went wrong while finding user loan data" });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again" });
  }
});

// Payment Histories API
const payrecord = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
    const userId = req.session.userId;
    PayRecord.find({ userId: userId })
      .then((payRecord) => {
        if (
          !payRecord ||
          payRecord.length < 1 ||
          typeof payRecord == "null" ||
          typeof payRecord == "undefined"
        ) {
          res
            .status(204)
            .json({ msg: "No payment record for this user at this time." });
        } else {
          res
            .status(200)
            .json({ msg: "All payment records found.", data: payRecord });
        }
      })
      .catch((err) => {
        res.status(500).json({
          msg: "Something went wrong while getting all payment records for this user.",
        });
      });
  } else {
    res.status(401).json({ msg: "Unauthorized user. Please log in again." });
  }
});

// Logout API
const logout = asyncWrapper(async (req, res) => {
  req.session.destroy();
  res.status(200).json({ msg: "Logout successful" });
});

module.exports = {
  login,
  register,
  verify,
  resendVerify,
  logout,
  isAuthenticated,
  forgotPassword,
  changePassword,
  viewResetPasswordPage,
  home,
  kycdata,
  payment,
  verifypayment,
  loanapplication,
  loanstatus,
  loanhistory,
  repayment,
  dashboard,
  payrecord,
};
