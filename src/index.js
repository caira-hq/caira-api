import "dotenv/config";
// Tangkap semua error yang tidak tertangkap sebelum server crash diam-diam
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
  process.exit(1);
});

import { validateEnv } from "./config/env.js"
validateEnv()

import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/userRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import apiKeyAuth from "./middlewares/apiKeyAuth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization","x-api-key"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ─── Rate Limiting (global) ───────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb", strict: true }));
app.use(apiKeyAuth);

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

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    logger.info(
      `[CAIRA-API] Server berjalan di http://localhost:${PORT} | ENV: ${process.env.NODE_ENV || "development"}`,
    );
  });
  
  server.on("error", (err) => {
    logger.error(`[FATAL] Gagal start server: ${err.message}`);
    process.exit(1);
  });
}


export default app;
