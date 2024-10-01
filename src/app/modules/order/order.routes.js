const express = require("express");
const { orderController } = require("./order.controller");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const router = express.Router();


router.post("/create", auth(ENUM_USER_ROLE.USER), orderController.createOrder);
router.get("/", orderController.getOrderForTrip);
router.get("/details/:orderId", 
  auth(
    ENUM_USER_ROLE.USER, 
    ENUM_USER_ROLE.DRIVER, 
    ENUM_USER_ROLE.ADMIN, 
    ENUM_USER_ROLE.SUPER_ADMIN),  
    orderController.getSingleOrderDetails);
 
router.patch("/cancel/:orderId", auth(
  ENUM_USER_ROLE.USER,
  ENUM_USER_ROLE.ADMIN, 
  ENUM_USER_ROLE.SUPER_ADMIN), 
  orderController.cancelOrder);

router.patch("/accept/:orderId", auth(ENUM_USER_ROLE.DRIVER), orderController.acceptOrder);

router.patch("/update-order-status/:orderId", 
  auth(ENUM_USER_ROLE.DRIVER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),  
  orderController.updateDriverByOrderStatus);

router.get("/history_driver", 
  auth(ENUM_USER_ROLE.DRIVER),  
  orderController.driverOrderHistory);

  router.get("/history_user", 
    auth(ENUM_USER_ROLE.USER),  
    orderController.userOrderHistory);

    router.get("/transactions/:driverId", 
      auth(ENUM_USER_ROLE.DRIVER),  
      orderController.userOrderHistory);

      router.get("/transactions/wallet/:driverId", 
        auth(ENUM_USER_ROLE.DRIVER),  
        orderController.driverTransactionHistory);
 
       
// router.post("/complete-destination/:orderId");
module.exports = router;