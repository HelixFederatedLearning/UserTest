// import express from 'express';
// import UploadLog from '../models/UploadLog.js';
// import { requireAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Final path is /api/client-log (mounted under /api)
// router.post('/client-log', requireAuth, async (req, res) => {
//   try {
//     const { filenames = [], consent = false, predictions = [] } = req.body || {};
//     if (!Array.isArray(predictions) || predictions.length === 0) {
//       return res.status(400).json({ error: 'predictions required' });
//     }
//     for (const p of predictions) {
//       if (typeof p?.label !== 'string' || typeof p?.prob !== 'number') {
//         return res.status(400).json({ error: 'predictions must be [{label:string, prob:number}]' });
//       }
//     }

//     const doc = await UploadLog.create({
//       userId: req.user.id,
//       filenames: Array.isArray(filenames) ? filenames.slice(0, 2) : [],
//       consent: !!consent,
//       predictions,
//     });

//     res.json({ ok: true, logId: doc._id });
//   } catch (err) {
//     console.error('client-log error:', err);
//     res.status(500).json({ error: 'failed to save client log' });
//   }
// });

// export default router;
import express from 'express';
import UploadLog from '../models/UploadLog.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/client-log
 * Body: { filenames?: string[], consent?: boolean, predictions: [{label, prob}] }
 * Saves local (on-device) predictions so they appear in History/CSV exactly like server runs.
 */
router.post('/client-log', requireAuth, async (req, res) => {
  try {
    const { filenames = [], consent = false, predictions = [] } = req.body || {};
    if (!Array.isArray(predictions) || predictions.length === 0) {
      return res.status(400).json({ error: 'predictions required' });
    }
    for (const p of predictions) {
      if (typeof p?.label !== 'string' || typeof p?.prob !== 'number') {
        return res.status(400).json({ error: 'predictions must be [{label:string, prob:number}]' });
      }
    }

    const userId = req.user.id || req.user._id; // support either shape
    const doc = await UploadLog.create({
      userId,
      filenames: Array.isArray(filenames) ? filenames.slice(0, 2) : [],
      consent: !!consent,
      predictions,
      source: 'local',
    });

    res.json({ ok: true, logId: doc._id });
  } catch (err) {
    console.error('client-log error:', err);
    res.status(500).json({ error: 'failed to save client log' });
  }
});

export default router;