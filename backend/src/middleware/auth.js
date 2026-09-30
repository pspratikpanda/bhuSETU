import { verifyToken } from '../utils/jwt.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Demo fallback for guest calls without token
    req.user = {
      id: 'USR-DEMO',
      name: 'Ananya Soren',
      role: 'Citizen',
      district: 'Khunti'
    };
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }

  req.user = payload;
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
