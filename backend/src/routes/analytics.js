import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    if (isPgConnected()) {
      const { rows } = await query('SELECT id, action, actor, target, timestamp FROM audit_logs ORDER BY timestamp DESC');
      return res.json({ success: true, count: rows.length, data: rows });
    }
    const auditLogs = db.getCollection('audit_logs')
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ success: true, count: auditLogs.length, data: auditLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/analytics/audit-logs', async (req, res) => {
  try {
    if (isPgConnected()) {
      const { rows } = await query('SELECT id, action, actor, target, timestamp FROM audit_logs ORDER BY timestamp DESC');
      return res.json({ success: true, count: rows.length, data: rows });
    }
    const auditLogs = db.getCollection('audit_logs')
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ success: true, count: auditLogs.length, data: auditLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/analytics
router.get('/', async (req, res) => {
  try {
    if (isPgConnected()) {
      const parcelsRes = await query('SELECT COUNT(*) FROM parcels');
      const appsRes = await query('SELECT COUNT(*) FROM applications');
      const pendingAppsRes = await query("SELECT COUNT(*) FROM applications WHERE status != 'Approved'");
      const docsRes = await query("SELECT COUNT(*) FROM documents WHERE status = 'Verified'");
      const conflictsRes = await query('SELECT COUNT(*) FROM conflicts');

      return res.json({
        success: true,
        data: {
          totalParcels: parseInt(parcelsRes.rows[0].count, 10),
          totalApplications: parseInt(appsRes.rows[0].count, 10),
          pendingApplications: parseInt(pendingAppsRes.rows[0].count, 10),
          verifiedDocuments: parseInt(docsRes.rows[0].count, 10),
          activeConflicts: parseInt(conflictsRes.rows[0].count, 10)
        }
      });
    }

    const parcels = db.getCollection('parcels');
    const applications = db.getCollection('applications');
    const documents = db.getCollection('documents');
    const conflicts = db.getCollection('conflicts');

    res.json({
      success: true,
      data: {
        totalParcels: parcels.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a) => a.status !== 'Approved').length,
        verifiedDocuments: documents.filter((d) => d.status === 'Verified').length,
        activeConflicts: conflicts.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
