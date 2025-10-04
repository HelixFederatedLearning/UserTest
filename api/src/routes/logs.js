// // api/src/routes/logs.js
// import express from 'express';
// import { UploadLog } from '../models/UploadLog.js';
// import { requireAuth } from '../middleware/auth.js';

// const router = express.Router();

// // GET /api/logs/me  -> list recent logs (JSON)
// router.get('/logs/me', requireAuth, async (req, res) => {
//   const userId = req.user._id;
//   const logs = await UploadLog.find({ userId }).sort({ createdAt: -1 }).limit(200).lean();
//   res.json({ logs });
// });

// // GET /api/logs/me/export  -> CSV with per-class probs
// router.get('/logs/me/export', requireAuth, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const logs = await UploadLog.find({ userId }).sort({ createdAt: -1 }).lean();

//     // Order must match DR_LABELS in uploads.js
//     const header = [
//       'timestamp',
//       'filenames',
//       'consent',
//       'top_label',
//       'prob_No_DR',
//       'prob_Mild',
//       'prob_Moderate',
//       'prob_Severe',
//       'prob_Proliferative_DR'
//     ];
//     const lines = [header.join(',')];

//     for (const l of logs) {
//       const map = Object.fromEntries((l.predictions || []).map(p => [p.label, p.prob]));
//       const topLabel = (l.predictions && l.predictions[0]?.label) || '';

//       const row = [
//         new Date(l.createdAt).toISOString(),
//         (l.filenames || []).join('|'),
//         l.consent ? 'yes' : 'no',
//         topLabel,
//         (map['No_DR'] ?? '').toString(),
//         (map['Mild'] ?? '').toString(),
//         (map['Moderate'] ?? '').toString(),
//         (map['Severe'] ?? '').toString(),
//         (map['Proliferative_DR'] ?? '').toString()
//       ];
//       lines.push(row.join(','));
//     }

//     const csv = lines.join('\n');
//     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//     res.setHeader('Content-Disposition', 'attachment; filename="dr_history.csv"');
//     res.send(csv);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: 'CSV export failed' });
//   }
// });

// export default router;
import express from 'express';
import UploadLog from '../models/UploadLog.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/logs/me  -> unified logs (local + server) newest first
router.get('/logs/me', requireAuth, async (req, res) => {
  const userId = req.user.id || req.user._id;
  const logs = await UploadLog.find({ userId }).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ logs });
});

// GET /api/logs/me/export  -> CSV export of unified logs
router.get('/logs/me/export', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const logs = await UploadLog.find({ userId }).sort({ createdAt: -1 }).lean();

    const header = ['timestamp','filenames','consent','source','top_label',
      'prob_No_DR','prob_Mild','prob_Moderate','prob_Severe','prob_Proliferative_DR'
    ];
    const lines = [header.join(',')];

    for (const l of logs) {
      const map = Object.fromEntries((l.predictions || []).map(p => [p.label, p.prob]));
      const topLabel = (l.predictions && l.predictions[0]?.label) || '';
      const row = [
        new Date(l.createdAt).toISOString(),
        (l.filenames || []).join('|'),
        l.consent ? 'yes' : 'no',
        l.source || '',
        topLabel,
        (map['No_DR'] ?? '').toString(),
        (map['Mild'] ?? '').toString(),
        (map['Moderate'] ?? '').toString(),
        (map['Severe'] ?? '').toString(),
        (map['Proliferative_DR'] ?? '').toString()
      ];
      lines.push(row.join(','));
    }

    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dr_history.csv"');
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'CSV export failed' });
  }
});

export default router;