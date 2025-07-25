const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Import Routes ---
const authRoutes = require('./api/routes/auth');
const jobRoutes = require('./api/routes/jobs');
const applicationRoutes = require('./api/routes/applications');
const userRoutes = require('./api/routes/users');
const analyticsRoutes = require('./api/routes/analytics');
const adminDashboardRoutes = require('./api/routes/adminDashboard');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});