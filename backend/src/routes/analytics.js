import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

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
