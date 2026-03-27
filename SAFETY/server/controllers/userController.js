const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { emergencyContacts: req.body.contacts },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.saveUserRoute = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.savedRoutes.push(req.body.route);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
