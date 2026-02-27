import { Router } from "express";
import { body } from "express-validator";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  register,
  login,
  sendOTP,
  verifyOTPHandler,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

router.use(authLimiter);

router.post(
  "/register",
  validate([
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("phone")
      .optional()
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage("Phone must be in E.164 format (e.g. +962791234567)"),
  ]),
  register
);

router.post(
  "/login",
  validate([
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  login
);

router.post(
  "/otp/send",
  validate([
    body("phone")
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage("Phone must be in E.164 format"),
  ]),
  sendOTP
);

router.post(
  "/otp/verify",
  validate([
    body("phone")
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage("Phone must be in E.164 format"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("Code must be 6 digits"),
  ]),
  verifyOTPHandler
);

router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
