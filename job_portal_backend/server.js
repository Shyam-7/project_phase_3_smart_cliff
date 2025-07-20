const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Import Routes ---
const authRoutes = require('./api/routes/auth');
const jobRoutes = require('./api/routes/jobs');
const applicationRoutes = require('./api/routes/applications');
const userRoutes = require('./api/routes/users'); // <-- ADD THIS LINE

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes); // <-- ADD THIS LINE

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});