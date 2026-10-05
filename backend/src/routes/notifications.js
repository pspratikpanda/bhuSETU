import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

// GET /api/v1/notifications
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, title, message, time, type, unread FROM notifications ORDER BY id DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
