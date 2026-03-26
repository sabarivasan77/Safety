const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['crime', 'lighting', 'hazard', 'crowd'],
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  comment: String,
  timestamp: { type: Date, default: Date.now },
  userId: String,
  severity: { type: Number, default: 5 } // 1-10
});

module.exports = mongoose.model('Report', ReportSchema);
