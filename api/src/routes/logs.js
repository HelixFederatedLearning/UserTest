import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { UploadLog } from '../models/UploadLog.js';

const router = express.Router();

router.get('/logs/me', authRequired, async (req, res, next) => {
  try {
    const logs = await UploadLog.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ logs });
  } catch (e) { next(e); }
});

router.get('/logs/me/export', authRequired, async (req, res, next) => {
  try {
    const logs = await UploadLog.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean();
    const header = 'timestamp,filenames,consent,label,probabilities\n';
    const rows = logs.map(l => {
      return l.predictions.map(p => {
        const probs = Array.isArray(p.probabilities) ? p.probabilities.map(n => n.toFixed(4)).join('|') : '';
        return `${new Date(l.createdAt).toISOString()},"${(l.filenames||[]).join('|')}",${l.consent},"${p.label}",${probs}`;
      }).join('\n');
    }).join('\n');
    const csv = header + rows + '\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dr_history.csv"');
    res.send(csv);
  } catch (e) { next(e); }
});

export default router;
