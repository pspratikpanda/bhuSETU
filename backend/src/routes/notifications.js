import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/notifications
router.get('/', (req, res) => {
  const notifications = db.getCollection('notifications');
  res.json({ success: true, count: notifications.length, data: notifications });
});

export default router;
