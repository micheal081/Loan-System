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
} = require("../controllers/loan");

router.route("/").get(home).post(isAuthenticated, logout);
router.route("/users").get(login).post(register);
router.route("/verify").get(resendVerify).post();
router.route("/:id").get().patch().delete();
router.route("/forgotpassword").post(forgotPassword);
router.route("/viewresetpasswordpage/:userId/:uniqueString").get(viewResetPasswordPage);
router.route("/changepassword/:userId/:uniqueString").get(changePassword);
router.route("/verify/:userId/:uniqueString").get(verify).post();

module.exports = router;
