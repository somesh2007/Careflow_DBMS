const express     = require('express');
const db          = require('../db');
const requireAuth = require('../middleware/auth');
const router      = express.Router();

router.use(requireAuth);

// GET /api/patients
router.get('/', async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const { rows } = await db.query(
      'SELECT * FROM patients WHERE name ILIKE $1 OR blood_group ILIKE $2 ORDER BY created_at DESC',
      [search, search]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/patients
router.post('/', async (req, res) => {
  const { name, age, gender, phone, address, blood_group } = req.body;
  if (!name || !age || !gender || !phone || !address || !blood_group)
    return res.status(400).json({ error: 'All fields are required' });
  if (age < 0 || age > 130)
    return res.status(400).json({ error: 'Age must be between 0 and 130' });
  try {
    const { rows } = await db.query(
      `INSERT INTO patients (name, age, gender, phone, address, blood_group)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, age, gender, phone, address, blood_group]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  const { name, age, gender, phone, address, blood_group } = req.body;
  if (!name || !age || !gender || !phone || !address || !blood_group)
    return res.status(400).json({ error: 'All fields are required' });
  if (age < 0 || age > 130)
    return res.status(400).json({ error: 'Age must be between 0 and 130' });
  try {
    const { rows } = await db.query(
      `UPDATE patients SET name=$1, age=$2, gender=$3, phone=$4, address=$5, blood_group=$6
       WHERE id=$7 RETURNING *`,
      [name, age, gender, phone, address, blood_group, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
