const { Router } = require("express");
const PaymentController = require("../payment/payment.controller");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const auth = require("../../middlewares/auth");
const { uploadFile } = require("../../middlewares/fileUploader");


const router = Router();

 

router.post("/stripe_bank/create/:id", 
  auth(ENUM_USER_ROLE.DRIVER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), 
  uploadFile(), 
  PaymentController.createConnectedAccountWithBank)

  router.patch("/stripe_bank/update/:id", 
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), 
    uploadFile(), 
    PaymentController.updateConnectedAccountWithBank)

    router.patch("/stripe_bank/transfers/:orderId", 
      auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),  
      PaymentController.TransferBallance)

     

   

 // router.post("/create-payment-intent",
//   PaymentController.createPaymentIntent);

// router.post(
//   "/user/save-payment-update-spending",
//   PaymentController.savePaymentUpdateSpending
// );

// router.patch(
//   "/driver/update-total-earning",
//   PaymentController.updateTotalEarning
// );

module.exports = router;
