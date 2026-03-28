const Report = require('../models/Report');

// Mock data for free engine fallback
const MOCK_REPORTS = [
  { id: '1', type: 'crowd', title: 'High Evening Traffic', message: 'Busy area, safe to traverse.', location: { lat: 40.7128, lng: -74.0060 }, severity: 'info' },
  { id: '2', type: 'lighting', title: 'Well Lit Path', message: 'Industrial lighting active.', location: { lat: 40.7306, lng: -73.9352 }, severity: 'success' }
];

exports.createReport = async (req, res) => {
  try {
    if (!Report.db.readyState) throw new Error('DB not connected');
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Attempt real fetch
    const reports = await Report.find().sort({ timestamp: -1 }).timeout(2000);
    res.json(reports.length > 0 ? reports : MOCK_REPORTS);
  } catch (err) {
    console.warn("MongoDB unavailable, falling back to mock routing data.");
    res.json(MOCK_REPORTS);
  }
};

exports.getReportsByRegion = async (req, res) => {
  try {
    const { ne_lat, ne_lng, sw_lat, sw_lng } = req.query;
    if (!Report.db.readyState) throw new Error('Offline');
    const reports = await Report.find({
      'location.lat': { $gte: sw_lat, $lte: ne_lat },
      'location.lng': { $gte: sw_lng, $lte: ne_lng }
    });
    res.json(reports);
  } catch (err) {
    res.json(MOCK_REPORTS);
  }
};
