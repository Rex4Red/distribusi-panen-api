require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const coreRoutes = require('./modules/core/core.routes');
const logistikRoutes = require('./modules/logistik/logistik.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Distribusi Panen Petani API',
    version: '1.0.0',
    modules: ['auth', 'core', 'logistik'],
  });
});

// Routes - 3 Module
app.use('/auth', authRoutes);       // Module 1: Auth
app.use('/', coreRoutes);           // Module 2: Core Business
app.use('/', logistikRoutes);       // Module 3: Logistik & Realtime

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🌾 Server running on http://localhost:${PORT}`);
  console.log(`📦 Modules: Auth | Core Business | Logistik`);
});

module.exports = app;
