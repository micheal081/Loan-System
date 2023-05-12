const express = require("express");
const router = express.Router();
const {
  login,
  register,
  verify,
  resendVerify,
  isAuthenticated,
  logout,
  forgotPassword,
  changePassword,
  viewResetPasswordPage,
  home,
  kycdata,
  verifypayment,
  payment,
  loanapplication,
  loanstatus,
  loanhistory,
  dashboard,
  repayment,
  payrecord,
} = require("../controllers/user");

const {
  adminregister,
  adminlogin,
  alladmin,
  approveadmin,
  disburse,
  allloanapplication,
  admindashboard,
  deleteadmin
} = require("../controllers/admin");

// Users' routes
router.route("/").get(home).post();
router.route("/dashboard").get(isAuthenticated, dashboard)
router.route("/logout").post(isAuthenticated, logout);
router.route("/users").get(login).post(register);
router.route("/verify").get(resendVerify).post();
router.route("/kyc").get().post(kycdata);
router.route("/direct").post(isAuthenticated, verifypayment); // /:reference
router.route("/check").get();
router.route("/payment").post(isAuthenticated, payment);
router.route("/forgotpassword").post(isAuthenticated,forgotPassword);
router.route("/loanstatus").get(isAuthenticated, loanstatus);
router.route("/loanapplication").post(isAuthenticated, loanapplication);
router.route("/loanhistory").get(isAuthenticated, loanhistory);
router.route("/payrecord").get(isAuthenticated, payrecord);
router.route("/repayment/:loanId").get(isAuthenticated, repayment);
router.route("/allloanapplication").get(isAuthenticated, allloanapplication);
router.route("/disburse/:loanId").post(isAuthenticated, disburse);
router
  .route("/viewresetpasswordpage/:userId/:uniqueString")
  .get(viewResetPasswordPage);
router.route("/changepassword/:userId/:uniqueString").get(changePassword);
router.route("/verify/:userId/:uniqueString").get(verify).post();

// Admin routes
router.route("/admin/").get(admindashboard);
router.route("/admin/register").post(adminregister);
router.route("/admin/login").get(adminlogin);
router.route("/admin/disburse/:loanId").post(disburse);
router.route("/admin/loanapplications").get(allloanapplication);
router.route("/admin/alladmins").get(alladmin);
router.route("/admin/approveadmin/:adminIdParam").post(approveadmin);
router.route("/admin/deleteadmin/:adminIdParam").delete(deleteadmin);


module.exports = router;
