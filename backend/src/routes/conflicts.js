import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

// GET /api/v1/conflicts
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, ulpin, field, revenue_val, registration_val, gis_val, status
      FROM conflicts
      ORDER BY id ASC
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
