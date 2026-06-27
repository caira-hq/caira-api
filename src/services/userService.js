const prisma = require("../config/db");
const { AppError } = require("../middlewares/errorHandler");

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

module.exports = { createUser };
