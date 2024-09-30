const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { uploadFile } = require("../../middlewares/fileUploader"); 
const { UserController } = require("./user.controller");

const router = express.Router();

// User routes
router.patch(
  "/edit-profile",
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  UserController.updateProfile
);
 
router.delete(
  "/delete-account",
  auth(ENUM_USER_ROLE.USER),
  UserController.deleteMyAccount
); 
 
// IDS Work routes
router.get(
  "/profile",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.getProfile
); 
 

 

module.exports = router;
