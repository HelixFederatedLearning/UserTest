// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import morgan from 'morgan';
// import rateLimit from 'express-rate-limit';
// import { config } from './config.js';
// import authRoutes from './routes/auth.js';
// import uploadRoutes from './routes/uploads.js';
// import logRoutes from './routes/logs.js';
// import { ensureSessionLoaded, isModelReady } from './services/onnx.js';

// const app = express();

// app.use(cors({ origin: config.corsOrigin, credentials: true }));
// app.use(express.json({ limit: '5mb' }));
// app.use(morgan('dev'));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// app.get('/health', (req, res) =>
//   res.json({
//     ok: true,
//     modelLoaded: isModelReady(),
//     mockInference: config.mockInference
//   })
// );

// app.use('/auth', authRoutes);
// app.use('/api', uploadRoutes);
// app.use('/api', logRoutes);

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ error: err.message || 'Server Error' });
// });

// async function start() {
//   await mongoose.connect(config.mongoUri);
//   // Don’t block startup on model availability:
//   ensureSessionLoaded().catch(() => {}); // fire-and-forget
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
import clientLogRoutes from './routes/client-log.js';
import { ensureSessionLoaded, isModelReady } from './services/onnx.js';

const app = express();

// CORS + preflight
const corsOptions = {
  origin: config.corsOrigin, // e.g. https://<your-netlify>.netlify.app
  credentials: true,
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Root & health
app.get('/', (_req, res) => res.type('text/plain').send('DR API OK. See /health and /api/*'));
app.get('/health', (_req, res) =>
  res.json({ ok: true, modelLoaded: isModelReady(), mockInference: config.mockInference })
);

// Mount under /api (frontend expects /api/*)
app.use('/api', authRoutes);       // /api/auth/*
app.use('/api', clientLogRoutes);  // /api/client-log
app.use('/api', uploadRoutes);     // /api/upload
app.use('/api', logRoutes);        // /api/logs/*

// (Optional) keep backward-compat for older frontends that call /auth/*
app.use('/auth', authRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

async function start() {
  if (!config.mongoUri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }
  console.log('MONGODB_URI(app)=', (config.mongoUri || '').replace(/:\/\/.*@/, '://<redacted>@'));

  await mongoose.connect(config.mongoUri);

  // don’t block startup on model availability
  ensureSessionLoaded().catch(() => {});
  app.listen(config.port, () => console.log(`API running on :${config.port}`));
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});