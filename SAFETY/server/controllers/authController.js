const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user store (works without MongoDB)
// Pre-seeded with a demo account
const users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@saferoute.ai',
    // Password: Demo@1234
    password: '$2b$10$qPANv7nfa8lJFjt64gww28Vj2Dm2KUDo0kQcuZbOsU0bIj/2'
  }
];

let nextId = 2;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user exists
    const existing = users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: String(nextId++),
      name: name || email.split('@')[0],
      email,
      password: hashedPassword
    };

    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'saferoute_dev_secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
