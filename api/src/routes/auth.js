import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config.js';

const router = express.Router();

const credsSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(6).max(128)
});

router.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = credsSchema.parse(req.body);
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = jwt.sign({ sub: user._id, username }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = credsSchema.parse(req.body);
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id, username }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username } });
  } catch (e) { next(e); }
});

export default router;
