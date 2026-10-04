import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/conflicts
router.get('/', async (req, res) => {
  try {
    if (isPgConnected()) {
      const { rows } = await query(`
        SELECT id, ulpin, field, revenue_val, registration_val, gis_val, status
        FROM conflicts
        ORDER BY id ASC
      `);
      return res.json({ success: true, count: rows.length, data: rows });
    }
    const conflicts = db.getCollection('conflicts');
    res.json({ success: true, count: conflicts.length, data: conflicts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
