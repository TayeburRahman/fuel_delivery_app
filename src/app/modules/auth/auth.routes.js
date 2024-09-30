const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { uploadFile } = require("../../middlewares/fileUploader");
const { AuthController } = require("../auth/auth.controller");

const router = express.Router();

// User routes
router.post("/register", AuthController.registrationAccount);
router.post(
  "/driver/register",
   uploadFile(), 
   AuthController.registrationDriverAccount);

router.post("/activate-user", AuthController.activateAccount);
router.post("/login", AuthController.loginAccount);
router.post("/resend", AuthController.resendActivationCode);
router.post("/active-resend", AuthController.resendCodeActivationAccount);
router.post("/forgot-resend", AuthController.resendCodeForgotAccount);
router.post("/forgot-password", AuthController.forgotPass);
router.patch(
  "/change-password",
  auth(ENUM_USER_ROLE.USER),
  AuthController.changePassword
);
router.post(
  "/reset-password", 
  AuthController.resetPassword
);
router.patch(
  "/user-block/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AuthController.blockAccount
);
router.post(
  "/verify-otp",
  AuthController.checkIsValidForgetActivationCode
); 

module.exports = router;
