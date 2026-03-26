const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true }
  }],
  savedRoutes: [{
    name: String,
    source: { lat: Number, lng: Number, name: String },
    destination: { lat: Number, lng: Number, name: String },
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('User', UserSchema);
