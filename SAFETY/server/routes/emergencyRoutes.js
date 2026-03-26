const express = require('express');
const router = express.Router();
const { triggerSOS, shareRoute } = require('../controllers/emergencyController');

router.post('/sos', triggerSOS);
router.post('/share', shareRoute);

module.exports = router;
