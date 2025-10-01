// api/src/routes/uploads.js
import express from 'express';
import multer from 'multer';
import { preprocessToTensor } from '../utils/preprocess.js';
import { ensureSessionLoaded, runInference } from '../services/onnx.js';
import { UploadLog } from '../models/UploadLog.js';

// NOTE: If your project uses a custom auth middleware, keep its import name the same.
// Commonly something like:
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Multer: memory storage, 2 files max, ~8MB each (adjust if you like)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 8 * 1024 * 1024 }
});

const DR_LABELS = ["No_DR", "Mild", "Moderate", "Severe", "Proliferative_DR"];

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

function postprocess(outputTensor) {
  // outputTensor may be: ort.Tensor with .data, or mock { data: Float32Array }
  const data = outputTensor?.data ?? outputTensor;
  const logits = Array.from(data);
  const probs = softmax(logits);

  // Build labeled probs and sort desc
  const predictions = DR_LABELS.map((label, i) => ({
    label,
    prob: probs[i] ?? 0
  })).sort((a, b) => b.prob - a.prob);

  const top = predictions[0] ?? { label: '', prob: 0 };
  return { predictions, top };
}

// POST /api/upload
router.post('/upload', requireAuth, upload.array('images', 2), async (req, res, next) => {
  try {
    await ensureSessionLoaded();

    const consent = String(req.body?.consent || '').toLowerCase() === 'true';
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    // preprocess first file (you can extend to batch if your model supports it)
    const tensors = [];
    for (const f of files) {
      const t = await preprocessToTensor(f.buffer);
      tensors.push(t);
    }
    // For now, run single-image inference per upload (first image)
    const output = await runInference(tensors[0]);

    const { predictions, top } = postprocess(output);
    const filenames = files.map(f => f.originalname);

    // Save log (probabilities included)
    await UploadLog.create({
      userId: req.user._id,
      filenames,
      consent,
      predictions,
      createdAt: new Date()
    });

    // Return all preds (sorted) & top
    res.json({
      ok: true,
      top,
      predictions
    });
  } catch (err) {
    next(err);
  }
});

export default router;
