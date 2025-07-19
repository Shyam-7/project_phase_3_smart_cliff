const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Import Routes ---
const authRoutes = require('./api/routes/auth');
const jobRoutes = require('./api/routes/jobs');

const app = express();

// --- Middleware ---
app.use(cors());          // Allows cross-origin requests from your Angular app
app.use(express.json());  // Parses incoming JSON requests so you can use req.body

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
// You will add more routes here as you build them

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});