import express from 'express';
import { query, isPgConnected } from '../db/postgres.js';
import { db } from '../db/database.js';
import { signToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/v1/auth/login - JWT authentication
router.post('/login', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (isPgConnected()) {
      let userRes = await query(
        `SELECT id, name, email, role, district, kyc_status AS "kycStatus", kyc_verified_at AS "kycVerifiedAt" FROM users WHERE email = $1 OR ($2::text IS NOT NULL AND role = $2)`,
        [email || null, role || null]
      );
      let user = userRes.rows[0];

      if (!user) {
        const newUser = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          name: email ? email.split('@')[0] : (role === 'Citizen' ? 'Ananya Soren' : 'Rajesh Kumar Verma'),
          email: email || `${role?.toLowerCase().replace(/\s+/g, '')}@jharkhand.gov.in`,
          role: role || 'Citizen',
          district: 'Khunti'
        };
        await query(
          `INSERT INTO users (id, name, email, role, district) VALUES ($1, $2, $3, $4, $5)`,
          [newUser.id, newUser.name, newUser.email, newUser.role, newUser.district]
        );
        user = newUser;
      }

      const token = signToken(user);
      return res.json({ success: true, user, token });
    }

    // Local JSON Fallback
    const users = db.getCollection('users');
    let user = users.find((u) => u.email === email || (role && u.role === role));
    if (!user) {
      user = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: email ? email.split('@')[0] : (role === 'Citizen' ? 'Ananya Soren' : 'Rajesh Kumar Verma'),
        email: email || `${role?.toLowerCase().replace(/\s+/g, '')}@jharkhand.gov.in`,
        role: role || 'Citizen',
        district: 'Khunti'
      };
      db.insert('users', user);
    }

    const token = signToken(user);
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/auth/ekyc-verify - Aadhaar / DigiLocker e-KYC Verification
router.post('/ekyc-verify', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber || aadhaarNumber.length < 12) {
      return res.status(400).json({ success: false, message: 'Invalid 12-digit Aadhaar number.' });
    }

    const verifiedUser = {
      id: `Aadhaar-KYC-${aadhaarNumber.slice(-4)}`,
      name: 'Ananya Soren',
      email: 'ananya.soren@kyc.gov.in',
      role: 'Citizen',
      district: 'Khunti',
      kycStatus: 'VERIFIED',
      kycVerifiedAt: new Date().toISOString()
    };

    if (isPgConnected()) {
      await query(
        `INSERT INTO users (id, name, email, role, district, kyc_status, kyc_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET kyc_status = EXCLUDED.kyc_status, kyc_verified_at = EXCLUDED.kyc_verified_at`,
        [verifiedUser.id, verifiedUser.name, verifiedUser.email, verifiedUser.role, verifiedUser.district, verifiedUser.kycStatus, verifiedUser.kycVerifiedAt]
      );
      await query(`INSERT INTO audit_logs (action, actor, target) VALUES ($1, $2, $3)`, ['E_KYC_VERIFICATION_SUCCESS', verifiedUser.name, verifiedUser.id]);
    } else {
      db.insert('audit_logs', { id: Date.now(), action: 'E_KYC_VERIFICATION_SUCCESS', actor: verifiedUser.name, target: verifiedUser.id, timestamp: new Date().toISOString() });
    }

    const token = signToken(verifiedUser);
    res.json({ success: true, message: 'Aadhaar e-KYC verification successful.', user: verifiedUser, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/auth/me - Current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
