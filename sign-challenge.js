/**
 * Helper script untuk testing auth flow Caira dari terminal.
 *
 * Cara pakai:
 *   node sign-challenge.js                  → generate keypair baru + auto login
 *   node sign-challenge.js --keypair        → hanya generate & tampilkan keypair baru
 *   node sign-challenge.js <SECRET_KEY>     → login menggunakan secret key yang sudah ada
 *
 * Pastikan server sudah berjalan: npm run dev
 */

const { Keypair } = require("@stellar/stellar-sdk");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const arg = process.argv[2];

// ─── Mode: hanya generate keypair ───────────────────────────────────────────
if (arg === "--keypair") {
  const keypair = Keypair.random();
  console.log("\n✅ Keypair Stellar baru (SIMPAN SECRET KEY dengan aman!):");
  console.log("  Public Key :", keypair.publicKey());
  console.log("  Secret Key :", keypair.secret());
  console.log("\nGunakan Public Key untuk register di Caira, lalu jalankan:");
  console.log(`  node sign-challenge.js ${keypair.secret()}\n`);
  process.exit(0);
}

// ─── Mode: login (dengan secret key atau generate baru) ──────────────────────
async function run() {
  let keypair;

  if (arg && arg.startsWith("S")) {
    // Pakai secret key yang diberikan
    try {
      keypair = Keypair.fromSecret(arg);
      console.log(`\n🔑 Menggunakan keypair: ${keypair.publicKey()}`);
    } catch {
      console.error(
        "\n❌ Secret key tidak valid. Harus dimulai dengan huruf S dan 56 karakter.",
      );
      process.exit(1);
    }
  } else {
    // Generate keypair baru untuk testing
    keypair = Keypair.random();
    console.log("\n🆕 Keypair baru di-generate untuk testing:");
    console.log("  Public Key :", keypair.publicKey());
    console.log("  Secret Key :", keypair.secret());
  }

  const publicKey = keypair.publicKey();

  // ── Step 1: Register user (kalau belum terdaftar) ─────────────────────────
  console.log("\n[1/3] Mendaftarkan wallet ke Caira...");
  const registerRes = await apiCall("POST", "/api/users", {
    stellar_wallet: publicKey,
    display_name: `Test User ${publicKey.slice(0, 6)}`,
  });

  if (registerRes.success) {
    console.log(`  ✅ Terdaftar! User ID: ${registerRes.data.id}`);
  } else if (registerRes.message?.includes("sudah terdaftar")) {
    console.log("  ℹ️  Wallet sudah terdaftar, lanjut login...");
  } else {
    console.error("  ❌ Gagal register:", registerRes.message);
    process.exit(1);
  }

  // ── Step 2: Request challenge ─────────────────────────────────────────────
  console.log("\n[2/3] Meminta challenge dari server...");
  const challengeRes = await apiCall("POST", "/api/auth/challenge", {
    stellar_wallet: publicKey,
  });

  if (!challengeRes.success) {
    console.error("  ❌ Gagal dapat challenge:", challengeRes.message);
    process.exit(1);
  }

  const message = challengeRes.data.message;
  console.log("  ✅ Challenge diterima.");

  // ── Step 3: Sign & verify ─────────────────────────────────────────────────
  console.log("\n[3/3] Menandatangani challenge dan login...");
  const signature = keypair.sign(Buffer.from(message)).toString("base64");

  const loginRes = await apiCall("POST", "/api/auth/verify", {
    stellar_wallet: publicKey,
    signature,
  });

  if (!loginRes.success) {
    console.error("  ❌ Login gagal:", loginRes.message);
    process.exit(1);
  }

  console.log("\n🎉 Login berhasil!");
  console.log("━".repeat(60));
  console.log("JWT Token (copy untuk dipakai di Postman):");
  console.log(loginRes.data.token);
  console.log("━".repeat(60));
  console.log("\nPakai token ini di header Authorization:");
  console.log(`  Authorization: Bearer ${loginRes.data.token}\n`);
}

// ─── Helper: fetch dengan error handling ─────────────────────────────────────
async function apiCall(method, path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    if (err.cause?.code === "ECONNREFUSED") {
      console.error(`\n❌ Tidak bisa konek ke server di ${BASE_URL}`);
      console.error("   Pastikan server sudah berjalan dengan: npm run dev\n");
    } else {
      console.error("\n❌ Network error:", err.message);
    }
    process.exit(1);
  }
}

run();
