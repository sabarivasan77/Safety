const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const reportRoutes = require('./routes/reportRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saferoute';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'SafeRoute AI Engine Running' });
});

app.use('/api/reports', reportRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on our end!' });
});

app.listen(PORT, () => {
  console.log(`🚀 SafeRoute AI Server listening on port ${PORT}`);
});
