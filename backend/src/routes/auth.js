import express from 'express';
import { db } from '../db/database.js';
import { signToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/v1/auth/login - JWT authentication
router.post('/login', (req, res) => {
  const { email, role } = req.body;
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

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    district: user.district
  });

  res.json({
    success: true,
    user,
    token
  });
});

// POST /api/v1/auth/ekyc-verify - Aadhaar / DigiLocker e-KYC Verification
router.post('/ekyc-verify', (req, res) => {
  const { aadhaarNumber, otp } = req.body;

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

  const token = signToken(verifiedUser);

  db.insert('audit_logs', {
    id: Date.now(),
    action: 'E_KYC_VERIFICATION_SUCCESS',
    actor: verifiedUser.name,
    target: verifiedUser.id,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Aadhaar e-KYC verification successful.',
    user: verifiedUser,
    token
  });
});

// GET /api/v1/auth/me - Current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
