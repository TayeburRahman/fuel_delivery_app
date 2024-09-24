const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { ManageController } = require("./manage.controller");

const router = express.Router();

router.post(
  "/add-terms-conditions",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addTermsConditions
);

router.post(
  "/add-support-contact",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addCustomerCare
);

router.post(
  "/add-privacy-policy",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addPrivacyPolicy
);

router.get(
  "/get-privacy-policy",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.getPrivacyPolicy
);

router.get(
  "/get-support-contact",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.getCustomerContact
);

router.get(
  "/get-terms-conditions",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.getTermsConditions
);

router.delete(
  "/delete-privacy-policy/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.deletePrivacyPolicy
);

router.delete(
  "/delete-terms-conditions/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.deleteTermsConditions
);

router.post(
  "/add-faq",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addFaq
);

router.get(
  "/get-single-faq/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.getSingleFaq
);

router.patch(
  "/update-single-faq/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.updateSingleFaq
);

router.delete(
  "/delete-single-faq/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.deleteSingleFaq
);

module.exports = router;
