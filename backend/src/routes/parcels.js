import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';
import { db } from '../db/database.js';

const router = express.Router();

function mapParcel(row) {
  return {
    id: row.id,
    ulpin: row.ulpin,
    owner: row.owner,
    area: row.area,
    landType: row.land_type,
    location: row.location,
    risk: row.risk,
    status: row.status,
    currentUse: row.current_use,
    surveyNumber: row.survey_number,
    registeredValue: row.registered_value,
    riskScores: row.risk_scores,
    ownershipHistory: row.ownership_history
  };
}

// GET /api/v1/parcels - list or search parcels
router.get('/', async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    if (isPgConnected()) {
      let sql = 'SELECT * FROM parcels';
      let params = [];
      if (searchQuery) {
        sql += ` WHERE LOWER(ulpin) LIKE $1 OR LOWER(owner) LIKE $1 OR LOWER(location) LIKE $1 OR LOWER(survey_number) LIKE $1`;
        params.push(`%${searchQuery.toLowerCase()}%`);
      }
      const { rows } = await query(sql, params);
      return res.json({ success: true, count: rows.length, data: rows.map(mapParcel) });
    }

    // Local JSON fallback
    let parcels = db.getCollection('parcels');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      parcels = parcels.filter((p) =>
        p.ulpin.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: parcels.length, data: parcels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/parcels/:ulpin - land intelligence profile
router.get('/:ulpin', async (req, res) => {
  try {
    const { ulpin } = req.params;

    if (isPgConnected()) {
      const { rows } = await query('SELECT * FROM parcels WHERE ulpin = $1', [ulpin]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Parcel not found' });
      }
      return res.json({ success: true, data: mapParcel(rows[0]) });
    }

    const parcel = db.findOne('parcels', (p) => p.ulpin === ulpin);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    res.json({ success: true, data: parcel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
