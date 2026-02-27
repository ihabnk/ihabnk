import { Router } from "express";
import { body } from "express-validator";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as paymentCtrl from "../controllers/payment.controller.js";

const router = Router();

router.post(
  "/checkout",
  authenticate,
  authorizeRoles("CUSTOMER"),
  validate([body("bookingId").isUUID().withMessage("Valid bookingId is required")]),
  paymentCtrl.createCheckout
);

router.post(
  "/confirm",
  authenticate,
  validate([body("checkoutId").notEmpty().withMessage("checkoutId is required")]),
  paymentCtrl.confirmPayment
);

router.post(
  "/refund",
  authenticate,
  authorizeRoles("CUSTOMER", "ADMIN"),
  validate([body("bookingId").isUUID().withMessage("Valid bookingId is required")]),
  paymentCtrl.refundPayment
);

export default router;
