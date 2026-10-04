import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/notifications
router.get('/', async (req, res) => {
  try {
    if (isPgConnected()) {
      const { rows } = await query('SELECT id, title, message, time, type, unread FROM notifications ORDER BY id DESC');
      return res.json({ success: true, count: rows.length, data: rows });
    }
    const notifications = db.getCollection('notifications');
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
