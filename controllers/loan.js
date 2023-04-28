// User mdoel
const User = require("../models/users");
// Know Your Customer model
const Kyc = require("../models/kyc");
// Loan Application model
const LoanApplication = require("../models/loanApplication");
// Loan Disbursement model
const Disburse = require("../models/disburse");
// Loan Repayment model
const Repayment = require("../models/repayment");
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
// Nodemailer packagae
const nodemailer = require("nodemailer");
// Dotenv file
require("dotenv").config();
// Custom Error middleware
const { createCustomError } = require("../errors/custom-error");

// render home page
const home = asyncWrapper(async (req, res) => {
  res.render("index");
});

// Create a transporter object
let transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
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
  await User.findOne({ email: { $eq: req.body.email } })
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
        res.status(200).json({ msg: "This user already exists", user: data });
      }
    })
    .catch((err) => console.log(err));
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
                  res.status(200).json({
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
                  .then(() => {
                    UserVerify.deleteOne({ userId })
                      .then(() => {
                        res.status(201).json({
                          msg: "User has been verified!",
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
                res.status(200).json({
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
        res.status(200).json({
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
                    res.status(201).json({
                      verification:
                        "A verification link has been sent to your email. Please check your inbox",
                      user: result,
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
        res.status(200).json({
          msg: "User does not exist",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(200).json({
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
                    res
                      .status(201)
                      .json({ msg: "Login successful", user: info });
                  } else {
                    ResetPassword.findOneAndDelete({ userId: info[0].userId })
                      .then(() => {
                        req.session.userId = data._id;
                        req.session.isAuth = true;
                        res
                          .status(201)
                          .json({ msg: "Login successful", user: info });
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
              res.status(200).json({ msg: "Incorrect details" });
            }
          })
          .catch((err) => res.status(200).json({ msg: "Incorrect details" }));
      } else {
        res.status(200).json({ msg: "User account has not been verified." });
      }
    })
    .catch((err) => res.status(200).json({ msg: "Incorrect details" }));
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
        res.status(200).json({
          msg: `${email} does not exist. Proceed to Signup!`,
        });
      } else {
        // Handles password reset
        console.log(data);
        sendPasswordLink(data, req, res);
        res
          .status(201)
          .json({
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
              // res.status(201).jFson({
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
              res.status(200).json({
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
                        res.status(201).json({
                          msg: "Password reset successful!",
                          user: data,
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
                res.status(200).json({
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
        res.status(200).json({
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

// Logout API
const logout = asyncWrapper(async (req, res) => {
  req.session.destroy();
  res.status(200).json({ msg: "Logout successful" });
});

// Dashboard API
const dashboard = asyncWrapper(async (req, res) => {
  if (req.session.isAuth) {
  } else {
  }
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
};
