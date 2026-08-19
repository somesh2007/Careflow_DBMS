const express     = require('express');
const db          = require('../db');
const requireAuth = require('../middleware/auth');
const router      = express.Router();

router.use(requireAuth);

const JOIN_QUERY = `
  SELECT
    a.id, a.appointment_date, a.reason, a.status, a.created_at,
    d.id   AS doctor_id,   d.name AS doctor_name,   d.specialization,
    p.id   AS patient_id,  p.name AS patient_name,  p.age, p.gender, p.blood_group
  FROM appointments a
  INNER JOIN doctors  d ON a.doctor_id  = d.id
  INNER JOIN patients p ON a.patient_id = p.id
`;

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(JOIN_QUERY + ' ORDER BY a.appointment_date DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(JOIN_QUERY + ' WHERE a.id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  const { doctor_id, patient_id, appointment_date, reason, status } = req.body;
  if (!doctor_id || !patient_id || !appointment_date || !reason)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const insert = await db.query(
      `INSERT INTO appointments (doctor_id, patient_id, appointment_date, reason, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [doctor_id, patient_id, appointment_date, reason, status || 'scheduled']
    );
    const newId = insert.rows[0].id;
    const { rows } = await db.query(JOIN_QUERY + ' WHERE a.id = $1', [newId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  const { doctor_id, patient_id, appointment_date, reason, status } = req.body;
  if (!doctor_id || !patient_id || !appointment_date || !reason || !status)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const result = await db.query(
      `UPDATE appointments
       SET doctor_id=$1, patient_id=$2, appointment_date=$3, reason=$4, status=$5
       WHERE id=$6 RETURNING id`,
      [doctor_id, patient_id, appointment_date, reason, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Appointment not found' });
    const { rows } = await db.query(JOIN_QUERY + ' WHERE a.id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ['scheduled', 'completed', 'cancelled'];
  if (!valid.includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    await db.query('UPDATE appointments SET status=$1 WHERE id=$2', [status, req.params.id]);
    const { rows } = await db.query(JOIN_QUERY + ' WHERE a.id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
