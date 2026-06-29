import { createUser } from "../services/userService.js";
import { created } from "../utils/response.js";

const registerUser = async (req, res, next) => {
  try {
    const { stellar_wallet, display_name } = req.body;
    const newUser = await createUser(stellar_wallet, display_name);
    return created(res, newUser, "User berhasil didaftarkan di Caira.");
  } catch (error) {
    next(error);
  }
};

export { registerUser };
