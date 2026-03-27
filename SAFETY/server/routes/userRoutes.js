const express = require('express');
const router = express.Router();
const { getUserProfile, updateEmergencyContacts, saveUserRoute } = require('../controllers/userController');

router.get('/:id', getUserProfile);
router.put('/:id/contacts', updateEmergencyContacts);
router.post('/:id/routes', saveUserRoute);

module.exports = router;
