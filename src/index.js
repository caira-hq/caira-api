require("dotenv").config();

// Tangkap semua error yang tidak tertangkap sebelum server crash diam-diam
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
  process.exit(1);
});

const { validateEnv } = require("./config/env");
validateEnv();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const userRoutes = require("./routes/userRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const authRoutes = require("./routes/authRoutes");
const { globalLimiter } = require("./middlewares/rateLimiter");
const {
  globalErrorHandler,
  notFoundHandler,
} = require("./middlewares/errorHandler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ─── Rate Limiting (global) ───────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb", strict: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invoices", invoiceRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Caira API is running.",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  logger.info(
    `[CAIRA-API] Server berjalan di http://localhost:${PORT} | ENV: ${process.env.NODE_ENV || "development"}`,
  );
});

server.on("error", (err) => {
  logger.error(`[FATAL] Gagal start server: ${err.message}`);
  process.exit(1);
});
