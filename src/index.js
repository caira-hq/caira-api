require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Agar Express bisa membaca JSON dari frontend

app.get('/api/welcome', (req, res) => {
  res.send('Caira API is running with Layered Architecture! 🚀');
});

app.use('/api/users', userRoutes);
app.use('/api/invoices',invoiceRoutes);

app.get('/', (req, res) => {
  res.send('Caira API is running with Layered Architecture! 🚀');
});

app.listen(PORT, () => {
  console.log(`[CAIRA-API] Server berjalan mulus di http://localhost:${PORT}`);
});