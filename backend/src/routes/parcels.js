import express from 'express';
import { query } from '../db/postgres.js';

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

    let sql = 'SELECT * FROM parcels';
    let params = [];
    if (searchQuery) {
      sql += ` WHERE LOWER(ulpin) LIKE $1 OR LOWER(owner) LIKE $1 OR LOWER(location) LIKE $1 OR LOWER(survey_number) LIKE $1`;
      params.push(`%${searchQuery.toLowerCase()}%`);
    }
    const { rows } = await query(sql, params);
    res.json({ success: true, count: rows.length, data: rows.map(mapParcel) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/parcels/:ulpin - land intelligence profile
router.get('/:ulpin', async (req, res) => {
  try {
    const { ulpin } = req.params;

    const { rows } = await query('SELECT * FROM parcels WHERE ulpin = $1', [ulpin]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    res.json({ success: true, data: mapParcel(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
