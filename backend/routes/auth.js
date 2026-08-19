const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const router  = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const { rows } = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    req.session.adminId   = admin.id;
    req.session.adminName = admin.username;
    res.json({ message: 'Login successful', username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session.adminId)
    return res.json({ loggedIn: true, username: req.session.adminName });
  res.json({ loggedIn: false });
});

module.exports = router;
