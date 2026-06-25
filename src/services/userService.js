const prisma = require('../config/db');

const createUser = async (walletAddress, displayName) => {
  const existingUser = await prisma.user.findUnique({
    where: { stellar_wallet: walletAddress }
  });

  if (existingUser) {
    throw new Error("Wallet Stellar ini sudah terdaftar di Caira!");
  }

  const user = await prisma.user.create({
    data: {
      stellar_wallet: walletAddress,
      display_name: displayName
    }
  });

  return user;
};

module.exports = {
  createUser
};