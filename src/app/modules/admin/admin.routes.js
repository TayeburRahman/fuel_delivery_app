const auth = require("../../middlewares/auth");
const express = require("express");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { uploadFile } = require("../../middlewares/fileUploader");
const { AdminController } = require("../admin/admin.controller");

const router = express.Router();
//! Admin Authentication Start
router.post("/auth/register", AdminController.registrationUser);
router.post("/auth/login", AdminController.login);
// --------------
router.post("/auth/refresh-token", AdminController.refreshToken);
router.post("/auth/forgot-password", AdminController.forgotPass);
router.post(
  "/auth/verify-otp",
  AdminController.checkIsValidForgetActivationCode
);
router.post("/auth/reset-password", AdminController.resetPassword);
router.patch(
  "/auth/change-password",
  auth(ENUM_USER_ROLE.ADMIN),
  AdminController.changePassword
);
router.post(
  "/auth/add-admin",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.registrationUser
);

router.get(
  "/auth/admins",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getAllAdmin
);
router.post(
  "/auth/add-user",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.createUser
);

//! Admin Update
router.patch(
  "/auth/edit-profile/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AdminController.updateAdmin
);
router.get(
  "/auth/profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.myProfile
);
router.delete(
  "/auth/delete/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.deleteAdmin
);

module.exports = router;
