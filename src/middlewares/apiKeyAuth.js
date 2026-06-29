const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  
  // Mencocokkan dengan kunci rahasia di .env server
  if (!apiKey || apiKey !== process.env.CAIRA_API_KEY) {
    console.warn(`[SECURITY] Akses ditolak! IP: ${req.ip} mencoba mengakses tanpa API Key.`);
    return res.status(403).json({
      success: false,
      message: "Akses Ditolak: API Key tidak valid atau tidak ditemukan!"
    });
  }
  
  next();
};

export default apiKeyAuth;