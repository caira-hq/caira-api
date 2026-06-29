import prisma from "../config/db.js";
import { AppError } from "../middlewares/errorHandler.js";

const createUser = async (walletAddress, displayName) => {
  const existingUser = await prisma.user.findUnique({
    where: { stellar_wallet: walletAddress },
  });

  if (existingUser) {
    throw new AppError("Wallet Stellar ini sudah terdaftar di Caira.", 409);
  }

  const user = await prisma.user.create({
    data: {
      stellar_wallet: walletAddress,
      display_name: displayName,
    },
  });

  return user;
};

export { createUser };
