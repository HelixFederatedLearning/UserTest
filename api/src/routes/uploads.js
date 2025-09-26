import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';
import { preprocessToTensor } from '../utils/preprocess.js';
import { runInference } from '../services/onnx.js';
import { UploadLog } from '../models/UploadLog.js';
import { storeImageIfConsented } from '../services/storage.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 2, fileSize: 8 * 1024 * 1024 } });

const bodySchema = z.object({
  consent: z.coerce.boolean()
});

// Map raw model outputs to human labels. Adjust for your model.
function postprocess(outputTensor) {
  const arr = Array.from(outputTensor.data);
  // If output is logits for 5 classes:
  const labels = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR'];
  // softmax
  const exps = arr.map(x => Math.exp(x - Math.max(...arr)));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(x => x / sum);
  const topIdx = probs.indexOf(Math.max(...probs));
  return { classIndex: topIdx, label: labels[topIdx] || `Class ${topIdx}`, probabilities: probs };
}

router.post('/upload', authRequired, upload.array('images', 2), async (req, res, next) => {
  try {
    const { consent } = bodySchema.parse(req.body);
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images uploaded' });

    // process each file
    const predictions = [];
    const filenames = [];
    for (const file of req.files) {
      const tensor = await preprocessToTensor(file.buffer);
      const output = await runInference(tensor);
      const pred = postprocess(output);
      predictions.push({ originalName: file.originalname, ...pred });
      filenames.push(file.originalname);

      if (consent) {
        try { await storeImageIfConsented(file.buffer, file.mimetype); } catch (e) { console.warn('Storage failed', e.message); }
      }
    }

    await UploadLog.create({
      userId: req.user.sub,
      filenames,
      consent,
      predictions
    });

    res.json({ ok: true, predictions });
  } catch (e) { next(e); }
});

export default router;
