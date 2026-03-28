const User = require('../models/User').default || require('../models/User');

exports.triggerSOS = async (req, res) => {
  const { userId, location } = req.body;
  try {
    const user = await User.findById(userId);
    console.log(`🚨 SOS TRIGGERED by user ${user ? user.name : userId} at [${location.lat}, ${location.lng}]`);
    
    // In a real application, you'd integrate an SMS API like Twilio or an Email service.
    // For now, return a mock success message.
    res.status(202).json({ 
      success: true, 
      message: 'SOS Signal Sent to Emergency Contacts',
      trackingLink: `https://saferoute.ai/track/${userId}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.shareRoute = async (req, res) => {
  const { userId, routeData, recipientEmail } = req.body;
  try {
    console.log(`Sharing route from user ${userId} to ${recipientEmail}`);
    res.json({ message: 'Route shared successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
