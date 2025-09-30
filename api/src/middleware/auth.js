// api/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Require a valid JWT in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success, sets req.user = { _id, username, ... } from the token payload.
 */
export const requireAuth = (req, res, next) => {
  try {
    const hdr = req.headers['authorization'] || req.headers['Authorization'];
    if (!hdr || !hdr.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = hdr.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const payload = jwt.verify(token, config.jwtSecret);

    // Accept several id claim conventions: _id | id | sub
    const uid = payload._id || payload.id || payload.sub;
    if (!uid) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = {
      _id: uid,
      username: payload.username,
      ...payload
    };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
