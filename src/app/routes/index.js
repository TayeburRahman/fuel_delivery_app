const express = require("express");
const router = express.Router();
const AuthRoutes = require("../modules/auth/auth.routes");
const AdminRoutes = require("../modules/admin/admin.routes"); 
const ManageRoutes = require("../modules/manage-web/manage.routes");
const DashboardRoutes = require("../modules/dashboard/dashboard.routes");
const PaymentRoutes = require("../modules/payment/payment.routes"); 
const notificationRoutes = require("../modules/notification/notification.route");
const reviewRoutes = require("../modules/review/review.route");
// Define routes--------------------
const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,  
  }, 
  {
    path: "/notification",
    route: notificationRoutes,
  }, 
  {
    path: "/review",
    route: reviewRoutes,
  }, 
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/manage",
    route: ManageRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
];

// Apply routes to the router
moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
