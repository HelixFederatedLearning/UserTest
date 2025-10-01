// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import morgan from 'morgan';
// import rateLimit from 'express-rate-limit';
// import { config } from './config.js';
// import authRoutes from './routes/auth.js';
// import uploadRoutes from './routes/uploads.js';
// import logRoutes from './routes/logs.js';
// import { ensureSessionLoaded } from './services/onnx.js';

// const app = express();

// app.use(cors({ origin: config.corsOrigin, credentials: true }));
// app.use(express.json({ limit: '5mb' }));
// app.use(morgan('dev'));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// app.get('/health', (req, res) => res.json({ ok: true }));

// app.use('/auth', authRoutes);
// app.use('/api', uploadRoutes);
// app.use('/api', logRoutes);

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ error: err.message || 'Server Error' });
// });

// async function start() {
//   await mongoose.connect(config.mongoUri);
//   await ensureSessionLoaded();
//   app.listen(config.port, () => {
//     console.log(`API running on :${config.port}`);
//   });
// }

// start().catch((e) => {
//   console.error('Failed to start server', e);
//   process.exit(1);
// });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import logRoutes from './routes/logs.js';
import { ensureSessionLoaded, isModelReady } from './services/onnx.js';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/health', (req, res) =>
  res.json({
    ok: true,
    modelLoaded: isModelReady(),
    mockInference: config.mockInference
  })
);

app.use('/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', logRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

async function start() {
  await mongoose.connect(config.mongoUri);
  // Don’t block startup on model availability:
  ensureSessionLoaded().catch(() => {}); // fire-and-forget
  app.listen(config.port, () => {
    console.log(`API running on :${config.port}`);
  });
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});
