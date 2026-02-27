import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.middleware.js";
import * as paymentService from "../services/payment.service.js";

export async function createCheckout(req, res, next) {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    if (booking.customerId !== req.user.userId) {
      throw new AppError(403, "You can only pay for your own bookings");
    }

    if (booking.paymentStatus === "PAID") {
      throw new AppError(400, "Booking is already paid");
    }

    const result = await paymentService.createCheckout(
      bookingId,
      booking.totalAmount,
      req.user.userId
    );

    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirmPayment(req, res, next) {
  try {
    const { checkoutId } = req.body;
    const result = await paymentService.confirmPayment(checkoutId);
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function refundPayment(req, res, next) {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    if (booking.status !== "CANCELLED") {
      throw new AppError(400, "Only cancelled bookings can be refunded");
    }

    if (booking.paymentStatus !== "PAID") {
      throw new AppError(400, "Booking has not been paid");
    }

    const result = await paymentService.refundPayment(bookingId);
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}
