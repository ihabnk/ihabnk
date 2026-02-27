// TODO: Replace mock with HyperPay when ready

import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.middleware.js";

const PLATFORM_CUT = 0.15;

export async function createCheckout(bookingId, amount, userId) {
  const checkoutId = `mock_${Date.now()}_${bookingId}`;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw new AppError(404, "Wallet not found for user");
  }

  const transaction = await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type: "DEBIT",
      status: "PENDING",
      description: `Checkout for booking ${bookingId}`,
      checkoutId,
      bookingId,
    },
  });

  return { checkoutId, amount, currency: "JOD", transactionId: transaction.id };
}

export async function confirmPayment(checkoutId) {
  const transaction = await prisma.transaction.findFirst({
    where: { checkoutId, status: "PENDING" },
    include: { booking: { include: { pro: true } } },
  });

  if (!transaction) {
    throw new AppError(404, "Pending transaction not found for this checkout");
  }

  const success = Math.random() > 0.05;
  const finalStatus = success ? "PAID" : "FAILED";

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: finalStatus },
  });

  if (!success) {
    return { success: false, transactionId: updated.id };
  }

  const booking = transaction.booking;
  const proUserId = booking?.pro?.userId;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "PAID" },
    });

    if (proUserId) {
      const proWallet = await tx.wallet.upsert({
        where: { userId: proUserId },
        create: { userId: proUserId, balance: 0 },
        update: {},
      });

      const proShare = transaction.amount * (1 - PLATFORM_CUT);

      await tx.wallet.update({
        where: { id: proWallet.id },
        data: { balance: { increment: proShare } },
      });

      await tx.transaction.create({
        data: {
          walletId: proWallet.id,
          amount: proShare,
          type: "CREDIT",
          status: "PAID",
          description: `Earning from booking ${booking.id} (85%)`,
          bookingId: booking.id,
        },
      });
    }
  });

  return { success: true, transactionId: updated.id };
}

export async function refundPayment(bookingId) {
  const paidTx = await prisma.transaction.findFirst({
    where: { bookingId, status: "PAID", type: "DEBIT" },
    include: { wallet: true },
  });

  if (!paidTx) {
    throw new AppError(404, "No paid transaction found for this booking");
  }

  const [refundTx] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        walletId: paidTx.walletId,
        amount: paidTx.amount,
        type: "CREDIT",
        status: "REFUNDED",
        description: `Refund for booking ${bookingId}`,
        bookingId,
      },
    }),
    prisma.transaction.update({
      where: { id: paidTx.id },
      data: { status: "REFUNDED" },
    }),
    prisma.wallet.update({
      where: { id: paidTx.walletId },
      data: { balance: { increment: paidTx.amount } },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "REFUNDED" },
    }),
  ]);

  return { success: true, refundId: refundTx.id };
}
