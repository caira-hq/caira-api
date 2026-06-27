const userService = require("../services/userService");
const response = require("../utils/response");

const registerUser = async (req, res, next) => {
  try {
    const { stellar_wallet, display_name } = req.body;
    const newUser = await userService.createUser(stellar_wallet, display_name);
    return response.created(
      res,
      newUser,
      "User berhasil didaftarkan di Caira.",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser };
