const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"];   

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Environment variable wajib belum diset: ${missing.join(", ")}`,
    );
  }
};

export  { validateEnv };
