// services/onnx.js
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let ort = null;               // runtime module (node or web)
let usingWasm = false;        // flag for health/debug
let session = null;

// Try to load native first (if installed), else fallback to WASM
async function loadOrt() {
  if (ort) return;
  const forceWasm = process.env.USE_WASM === 'true';
  if (!forceWasm) {
    try {
      // Will succeed only if onnxruntime-node is installed + native binary compatible
      const m = await import('onnxruntime-node');
      ort = m.default || m; // ESM/CJS interop
      usingWasm = false;
      console.log('[ORT] Using native onnxruntime-node (CPU EP)');
      return;
    } catch (e) {
      console.warn('[ORT] Native not available, falling back to WASM:', e?.message);
    }
  }
  // WASM fallback
  const m = await import('onnxruntime-web');
  ort = m; // onnxruntime-web exports namespace
  usingWasm = true;
  // point to wasm assets
  ort.env.wasm.wasmPaths = path.join(__dirname, '../../node_modules/onnxruntime-web/dist/');
  console.log('[ORT] Using onnxruntime-web (WASM EP)');
}

async function downloadModel(url) {
  const tmp = path.join(os.tmpdir(), 'dr_model.onnx');
  const writer = fs.createWriteStream(tmp);
  const resp = await axios.get(url, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    resp.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  return tmp;
}

export async function ensureSessionLoaded() {
  await loadOrt();
  if (session || config.mockInference) return session;

  let modelPath = config.onnx.localPath;
  if (!modelPath && config.onnx.modelUrl) {
    console.log('Downloading ONNX model...');
    modelPath = await downloadModel(config.onnx.modelUrl);
  }
  if (!modelPath) {
    if (config.skipOnnxLoadOnBoot) {
      console.warn('ONNX model not configured; running without a model.');
      return null;
    }
    throw new Error('No ONNX model configured.');
  }

  console.log('Loading ONNX model from', modelPath);

  if (usingWasm) {
    const bytes = fs.readFileSync(modelPath);
    session = await ort.InferenceSession.create(bytes, {
      executionProviders: ['wasm']
    });
  } else {
    // native
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpuExecutionProvider']
    });
  }
  return session;
}

export function isModelReady() {
  return !!session;
}

// tensor: an ort.Tensor prepared by preprocess
export async function runInference(tensor) {
  if (config.mockInference) {
    const logits = new Float32Array([0.1, 0.2, 0.3, 0.1, 0.05]);
    return { data: logits };
  }
  if (!session) await ensureSessionLoaded();
  if (!session) {
    const e = new Error('Model not available');
    e.status = 503;
    throw e;
  }
  const feeds = {};
  feeds[config.onnx.inputName] = tensor;
  const results = await session.run(feeds);
  const output = results[config.onnx.outputName];
  return output;
}

// Optional: expose which backend we’re on (useful in /health)
export function getOrtBackend() {
  return usingWasm ? 'wasm' : 'native';
}
