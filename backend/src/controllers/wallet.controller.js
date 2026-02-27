import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/error.middleware.js";

export async function getMyWallet(req, res, next) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
      include: {
        transactions: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!wallet) {
      throw new AppError(404, "Wallet not found");
    }

    res.json({
      status: "success",
      data: {
        balance: wallet.balance,
        currency: "JOD",
        transactions: wallet.transactions,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function topUp(req, res, next) {
  try {
    const { amount } = req.body;

    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.user.userId, balance: 0 },
      });
    }

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: "CREDIT",
          status: "PAID",
          description: "Mock wallet top-up",
        },
      }),
    ]);

    res.status(201).json({
      status: "success",
      data: {
        balance: updatedWallet.balance,
        currency: "JOD",
        transactionId: transaction.id,
      },
    });
  } catch (err) {
    next(err);
  }
}
