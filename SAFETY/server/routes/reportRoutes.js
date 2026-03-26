const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportsByRegion } = require('../controllers/reportController');

router.post('/', createReport);
router.get('/', getReports);
router.get('/region', getReportsByRegion);

module.exports = router;
