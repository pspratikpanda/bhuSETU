import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { emitToOfficers, emitToUser } from '../socket/socketManager.js';

const router = express.Router();

// GET /api/v1/applications - get applications list
router.get('/', (req, res) => {
  const { status } = req.query;
  let applications = db.getCollection('applications');

  if (status && status !== 'All') {
    applications = applications.filter((app) =>
      app.status.toLowerCase().includes(status.toLowerCase())
    );
  }

  res.json({ success: true, count: applications.length, data: applications });
});

// GET /api/v1/applications/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const application = db.findOne('applications', (app) => app.id === id);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  res.json({ success: true, data: application });
});

// POST /api/v1/applications - submit new mutation application (Authenticated)
router.post('/', authenticateToken, (req, res) => {
  const { applicant, ulpin, type, reason, notes } = req.body;

  const newApp = {
    id: `MU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    applicant: applicant || req.user?.name || 'Ananya Soren',
    applicantId: req.user?.id, // Store ID to send socket notifications later
    ulpin: ulpin || 'JH-22-1048-0021',
    type: type || 'Mutation',
    reason: reason || 'Registered sale or transfer',
    submitted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Submitted',
    department: 'Revenue Department',
    priority: 'Normal',
    step: 1,
    notes: notes || ''
  };

  db.insert('applications', newApp);
  db.insert('audit_logs', {
    id: Date.now(),
    action: 'CREATE_MUTATION_APPLICATION',
    actor: newApp.applicant,
    target: newApp.id,
    timestamp: new Date().toISOString()
  });

  // ── Real-time: notify all officers of new queue item ──────────────────────
  const queueLength = db.getCollection('applications').filter(
    (a) => a.status === 'Submitted'
  ).length;
  emitToOfficers('officer:queue_updated', {
    queueLength,
    newApplicationId: newApp.id,
    applicant: newApp.applicant,
    ulpin: newApp.ulpin,
    timestamp: new Date().toISOString(),
  });

  // ── Real-time: notify submitting citizen via their private room ────────────
  const userId = req.user?.id;
  if (userId) {
    emitToUser(userId, 'notification:new', {
      id: `notif-${Date.now()}`,
      type: 'application',
      title: 'Application Submitted',
      message: `Your mutation application ${newApp.id} has been submitted successfully.`,
      timestamp: new Date().toISOString(),
      unread: true,
    });
  }

  res.status(201).json({ success: true, data: newApp });
});

// PATCH /api/v1/applications/:id/decision - officer review decision (RBAC: Officers & Admins only)
router.patch(
  '/:id/decision',
  authenticateToken,
  requireRole('Revenue Officer', 'Registration Officer', 'GIS / Survey Officer', 'Administrator'),
  (req, res) => {
    const { id } = req.params;
    const { decision } = req.body;
    const officerName = req.user?.name || 'Revenue Officer';

    let newStatus = 'Under review';
    let step = 2;
    if (decision === 'Approved') {
      newStatus = 'Approved';
      step = 4;
    } else if (decision === 'Returned for correction') {
      newStatus = 'Rejected';
      step = 3;
    }

    const updated = db.update('applications', (app) => app.id === id, {
      status: newStatus,
      step,
      officerNotes: decision
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    db.insert('audit_logs', {
      id: Date.now(),
      action: `OFFICER_DECISION_${decision.toUpperCase().replace(/\s+/g, '_')}`,
      actor: officerName,
      target: id,
      timestamp: new Date().toISOString()
    });

    // ── Real-time: broadcast status change globally (citizen + officers) ──────
    emitToOfficers('application:status_changed', {
      applicationId: id,
      status: newStatus,
      updatedBy: officerName,
      timestamp: new Date().toISOString(),
    });

    // Also emit to the applicant's room if we can identify them
    const application = db.findOne('applications', (app) => app.id === id);
    if (application?.applicantId) {
      emitToUser(application.applicantId, 'notification:new', {
        id: `notif-${Date.now()}`,
        type: 'application',
        title: `Application ${newStatus}`,
        message: `Your application ${id} status has been updated to: ${newStatus} by ${officerName}.`,
        timestamp: new Date().toISOString(),
        unread: true,
      });
    }

    res.json({ success: true, data: updated, reviewer: officerName });
  }
);

export default router;


