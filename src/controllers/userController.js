const userService = require('../services/userService');

const registerUser = async (req, res) => {
  try {
    const { stellar_wallet, display_name } = req.body;
    
    if (!stellar_wallet || !display_name) {
      return res.status(400).json({ success: false, message: "Wallet dan Nama wajib diisi!" });
    }

    const newUser = await userService.createUser(stellar_wallet, display_name);
    
    res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan di Caira!",
      data: newUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser
};