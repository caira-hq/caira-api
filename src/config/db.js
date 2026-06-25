const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Mengimpor PrismaClient dari folder generated sesuai strukturmu
const { PrismaClient } = require('@prisma/client'); 

// Mengambil URL dari .env
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Instance ini akan digunakan di seluruh file Service
const prisma = new PrismaClient({ adapter });

module.exports = prisma;