const { Router } = require("express");
const PaymentController = require("../payment/payment.controller");

const router = Router();

router.post("/create-payment-intent", PaymentController.createPaymentIntent);

router.post(
  "/user/save-payment-update-spending",
  PaymentController.savePaymentUpdateSpending
);

router.patch(
  "/driver/update-total-earning",
  PaymentController.updateTotalEarning
);

module.exports = router;
