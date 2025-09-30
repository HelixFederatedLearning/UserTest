// api/src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { User } from '../models/User.js';

const router = express.Router();

const credsSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

function signToken(user) {
  // Put _id and username in payload; 24h expiry
  return jwt.sign(
    { _id: user._id.toString(), username: user.username },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = credsSchema.parse(req.body);

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash: hash });

    const token = signToken(user);
    res.json({
      token,
      user: { _id: user._id, username: user.username }
    });
  } catch (e) {
    if (e?.issues) {
      return res.status(400).json({ error: e.issues[0]?.message || 'Invalid input' });
    }
    console.error(e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = credsSchema.parse(req.body);

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      token,
      user: { _id: user._id, username: user.username }
    });
  } catch (e) {
    if (e?.issues) {
      return res.status(400).json({ error: e.issues[0]?.message || 'Invalid input' });
    }
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
