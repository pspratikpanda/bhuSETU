import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/conflicts
router.get('/', (req, res) => {
  const conflicts = db.getCollection('conflicts');
  res.json({ success: true, count: conflicts.length, data: conflicts });
});

export default router;
