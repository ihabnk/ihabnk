import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import * as walletCtrl from "../controllers/wallet.controller.js";

const router = Router();

router.get("/me", authenticate, walletCtrl.getMyWallet);

router.post(
  "/topup",
  authenticate,
  validate([
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),
  ]),
  walletCtrl.topUp
);

export default router;
