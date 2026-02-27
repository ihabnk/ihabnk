import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { env } from "../config/env.js";
import { sendOTP as twilioSendOTP, verifyOTP as twilioVerifyOTP } from "../services/twilio.service.js";
import { AppError } from "../middleware/error.middleware.js";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        passwordHash,
        wallet: { create: {} },
      },
      include: { wallet: true },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(201).json({
      status: "success",
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new AppError(401, "Invalid email or password");
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.json({
      status: "success",
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/otp/send
export async function sendOTP(req, res, next) {
  try {
    const { phone } = req.body;
    const status = await twilioSendOTP(phone);
    return res.json({ status: "success", otpStatus: status });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/otp/verify
export async function verifyOTPHandler(req, res, next) {
  try {
    const { phone, code } = req.body;
    const approved = await twilioVerifyOTP(phone, code);

    if (!approved) {
      throw new AppError(400, "Invalid or expired OTP");
    }

    const user = await prisma.user.findFirst({ where: { phone } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return res.json({ status: "success", verified: true });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/refresh
export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError(401, "Refresh token missing");
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    const accessToken = signAccessToken(user);

    return res.json({ status: "success", accessToken });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/logout
export async function logout(_req, res) {
  res.clearCookie("refreshToken", { path: "/" });
  return res.json({ status: "success", message: "Logged out" });
}
