const express     = require('express');
const db          = require('../db');
const requireAuth = require('../middleware/auth');
const router      = express.Router();

router.use(requireAuth);

// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const { rows } = await db.query(
      'SELECT * FROM doctors WHERE name ILIKE $1 OR specialization ILIKE $2 ORDER BY created_at DESC',
      [search, search]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/doctors
router.post('/', async (req, res) => {
  const { name, specialization, phone, email, room_no } = req.body;
  if (!name || !specialization || !phone || !email || !room_no)
    return res.status(400).json({ error: 'All fields are required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });
  try {
    const { rows } = await db.query(
      `INSERT INTO doctors (name, specialization, phone, email, room_no)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, specialization, phone, email, room_no]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/doctors/:id
router.put('/:id', async (req, res) => {
  const { name, specialization, phone, email, room_no } = req.body;
  if (!name || !specialization || !phone || !email || !room_no)
    return res.status(400).json({ error: 'All fields are required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });
  try {
    const { rows } = await db.query(
      `UPDATE doctors SET name=$1, specialization=$2, phone=$3, email=$4, room_no=$5
       WHERE id=$6 RETURNING *`,
      [name, specialization, phone, email, room_no, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/doctors/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
