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
const contentRoutes = require('./api/routes/content');
const communicationRoutes = require('./api/routes/communication');

// --- Import Scheduled Job Manager ---
const scheduledJobManager = require('./scheduledJobs');

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
app.use('/api/content', contentRoutes);
app.use('/api/communication', communicationRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start the scheduled job manager
  scheduledJobManager.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  scheduledJobManager.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  scheduledJobManager.stop();
  process.exit(0);
});