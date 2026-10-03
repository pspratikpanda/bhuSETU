import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET /api/v1/audit-logs
router.get('/audit-logs', (req, res) => {
  const auditLogs = db.getCollection('audit_logs')
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ success: true, count: auditLogs.length, data: auditLogs });
});

// Preserve the analytics-prefixed URL for clients that group these routes.
router.get('/analytics/audit-logs', (req, res) => {
  const auditLogs = db.getCollection('audit_logs')
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ success: true, count: auditLogs.length, data: auditLogs });
});

// GET /api/v1/analytics
router.get('/', (req, res) => {
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
});

export default router;
