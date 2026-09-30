import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/parcels - list or search parcels
router.get('/', (req, res) => {
  const { query, district } = req.query;
  let parcels = db.getCollection('parcels');

  if (query) {
    const q = query.toLowerCase();
    parcels = parcels.filter((p) =>
      p.ulpin.toLowerCase().includes(q) ||
      p.owner.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.surveyNumber.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: parcels.length, data: parcels });
});

// GET /api/v1/parcels/:ulpin - land intelligence profile
router.get('/:ulpin', (req, res) => {
  const { ulpin } = req.params;
  const parcel = db.findOne('parcels', (p) => p.ulpin === ulpin);

  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  }

  res.json({ success: true, data: parcel });
});

export default router;
