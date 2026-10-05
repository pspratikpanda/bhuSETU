import express from 'express';
import { query } from '../db/postgres.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { emitToOfficers, emitToUser } from '../socket/socketManager.js';

const router = express.Router();

// GET /api/v1/applications - get applications list
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let sql = 'SELECT * FROM applications';
    let params = [];
    if (status && status !== 'All') {
      sql += ' WHERE LOWER(status) LIKE $1';
      params.push(`%${status.toLowerCase()}%`);
    }
    sql += ' ORDER BY id DESC';
    const { rows } = await query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/applications/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/applications - submit new mutation application (Authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { applicant, ulpin, type, reason, notes } = req.body;

    const newApp = {
      id: `MU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      applicant: applicant || req.user?.name || 'Ananya Soren',
      applicantId: req.user?.id,
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

    await query(
      `INSERT INTO applications (id, applicant, ulpin, type, reason, submitted, status, department, priority, step, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [newApp.id, newApp.applicant, newApp.ulpin, newApp.type, newApp.reason, newApp.submitted, newApp.status, newApp.department, newApp.priority, newApp.step, newApp.notes]
    );
    await query(`INSERT INTO audit_logs (action, actor, target) VALUES ($1, $2, $3)`, ['CREATE_MUTATION_APPLICATION', newApp.applicant, newApp.id]);
    const queueRes = await query("SELECT COUNT(*) FROM applications WHERE status = 'Submitted'");
    const queueLength = parseInt(queueRes.rows[0].count, 10);

    emitToOfficers('officer:queue_updated', {
      queueLength,
      newApplicationId: newApp.id,
      applicant: newApp.applicant,
      ulpin: newApp.ulpin,
      timestamp: new Date().toISOString(),
    });

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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/applications/:id/decision - officer review decision
router.patch(
  '/:id/decision',
  authenticateToken,
  requireRole('Revenue Officer', 'Registration Officer', 'GIS / Survey Officer', 'Administrator'),
  async (req, res) => {
    try {
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

      const { rows } = await query(
        `UPDATE applications SET status = $1, step = $2, notes = COALESCE(notes, '') || $3 WHERE id = $4 RETURNING *`,
        [newStatus, step, ` | Officer Decision: ${decision}`, id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      const updated = rows[0];
      await query(`INSERT INTO audit_logs (action, actor, target) VALUES ($1, $2, $3)`, [`OFFICER_DECISION_${decision.toUpperCase().replace(/\s+/g, '_')}`, officerName, id]);

      emitToOfficers('application:status_changed', {
        applicationId: id,
        status: newStatus,
        updatedBy: officerName,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, data: updated, reviewer: officerName });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
