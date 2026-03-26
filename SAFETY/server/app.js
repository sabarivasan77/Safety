const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saferoute';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Models
const ReportSchema = new mongoose.Schema({
  type: String, // 'crime', 'lighting', 'hazard'
  location: {
    lat: Number,
    lng: Number
  },
  comment: String,
  timestamp: { type: Date, default: Date.now },
  userId: String
});
const Report = mongoose.model('Report', ReportSchema);

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  emergencyContacts: [{ name: String, phone: String }]
});
const User = mongoose.model('User', UserSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'SafeRoute AI Engine Running' });
});

// Community Reports
app.post('/api/reports', async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Emergency SOS Trigger
app.post('/api/emergency/sos', (req, res) => {
  const { userId, location } = req.body;
  console.log(`🚨 SOS TRIGGERED by user ${userId} at [${location.lat}, ${location.lng}]`);
  
  // Mock sending SMS/Alerts to emergency contacts
  res.status(202).json({ 
    success: true, 
    message: 'SOS Signal Sent to Emergency Contacts',
    trackingLink: `https://saferoute.ai/track/${userId}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SafeRoute AI Server listening on port ${PORT}`);
});
