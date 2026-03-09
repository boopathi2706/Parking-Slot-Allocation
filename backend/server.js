const express = require('express');
const cors = require('cors');
const path = require('path');

// Path to .env relative to this file
const envPath = path.join(__dirname, '.env');

require('dotenv').config({ path: envPath });

const connectDB = require('./config/db');
const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/allocations', require('./routes/allocationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));