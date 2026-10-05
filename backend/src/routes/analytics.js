import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

// GET /api/v1/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, action, actor, target, timestamp FROM audit_logs ORDER BY timestamp DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/analytics/audit-logs', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, action, actor, target, timestamp FROM audit_logs ORDER BY timestamp DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/analytics
router.get('/', async (req, res) => {
  try {
    const parcelsRes = await query('SELECT COUNT(*) FROM parcels');
    const appsRes = await query('SELECT COUNT(*) FROM applications');
    const pendingAppsRes = await query("SELECT COUNT(*) FROM applications WHERE status != 'Approved'");
    const docsRes = await query("SELECT COUNT(*) FROM documents WHERE status = 'Verified'");
    const conflictsRes = await query('SELECT COUNT(*) FROM conflicts');

    res.json({
      success: true,
      data: {
        totalParcels: parseInt(parcelsRes.rows[0].count, 10),
        totalApplications: parseInt(appsRes.rows[0].count, 10),
        pendingApplications: parseInt(pendingAppsRes.rows[0].count, 10),
        verifiedDocuments: parseInt(docsRes.rows[0].count, 10),
        activeConflicts: parseInt(conflictsRes.rows[0].count, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
