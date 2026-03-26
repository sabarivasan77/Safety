const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReportsByRegion = async (req, res) => {
  const { ne_lat, ne_lng, sw_lat, sw_lng } = req.query;
  try {
    const reports = await Report.find({
      'location.lat': { $gte: sw_lat, $lte: ne_lat },
      'location.lng': { $gte: sw_lng, $lte: ne_lng }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
