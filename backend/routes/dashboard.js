const express     = require('express');
const db          = require('../db');
const requireAuth = require('../middleware/auth');
const router      = express.Router();

router.use(requireAuth);

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const { rows: r1 } = await db.query('SELECT COUNT(*) AS "totalDoctors" FROM doctors');
    const { rows: r2 } = await db.query('SELECT COUNT(*) AS "totalPatients" FROM patients');
    const { rows: r3 } = await db.query("SELECT COUNT(*) AS upcoming FROM appointments WHERE status='scheduled'");
    const { rows: r4 } = await db.query("SELECT COUNT(*) AS completed FROM appointments WHERE status='completed'");

    const totalDoctors  = parseInt(r1[0].totalDoctors,  10);
    const totalPatients = parseInt(r2[0].totalPatients, 10);
    const upcoming      = parseInt(r3[0].upcoming,      10);
    const completed     = parseInt(r4[0].completed,     10);

    // Appointments per doctor (for bar chart)
    const { rows: appointmentsByDoctor } = await db.query(`
      SELECT d.id AS "doctorId", d.name AS "doctorName",
             COUNT(a.id)::int AS count
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id = d.id
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `);

    // Recent 5 appointments
    const { rows: recentAppointments } = await db.query(`
      SELECT a.id, a.appointment_date, a.reason, a.status,
             d.name AS doctor_name, p.name AS patient_name
      FROM appointments a
      INNER JOIN doctors  d ON a.doctor_id  = d.id
      INNER JOIN patients p ON a.patient_id = p.id
      ORDER BY a.appointment_date DESC
      LIMIT 5
    `);

    res.json({ totalDoctors, totalPatients, upcoming, completed, appointmentsByDoctor, recentAppointments });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
