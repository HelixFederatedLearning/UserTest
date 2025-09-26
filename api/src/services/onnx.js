// import fs from 'fs';
// import path from 'path';
// import os from 'os';
// import axios from 'axios';
// import ort from 'onnxruntime-node';
// import { config } from '../config.js';

// let session = null;

// async function downloadModel(url) {
//   const tmp = path.join(os.tmpdir(), 'dr_model.onnx');
//   const writer = fs.createWriteStream(tmp);
//   const resp = await axios.get(url, { responseType: 'stream' });
//   await new Promise((resolve, reject) => {
//     resp.data.pipe(writer);
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
//   return tmp;
// }

// export async function ensureSessionLoaded() {
//   if (session) return session;
//   let modelPath = config.onnx.localPath;
//   if (!modelPath && config.onnx.modelUrl) {
//     console.log('Downloading ONNX model...');
//     modelPath = await downloadModel(config.onnx.modelUrl);
//   }
//   if (!modelPath) throw new Error('No ONNX model configured.');
//   console.log('Loading ONNX model from', modelPath);
//   session = await ort.InferenceSession.create(modelPath, {
//     executionProviders: ['cpuExecutionProvider']
//   });
//   return session;
// }

// export async function runInference(tensor) {
//   if (!session) await ensureSessionLoaded();
//   const feeds = {};
//   feeds[config.onnx.inputName] = tensor;
//   const results = await session.run(feeds);
//   const output = results[config.onnx.outputName];
//   return output;
// }
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import ort from 'onnxruntime-node';
import { config } from '../config.js';

let session = null;

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
  if (session || config.mockInference) return session;
  let modelPath = config.onnx.localPath;
  if (!modelPath && config.onnx.modelUrl) {
    console.log('Downloading ONNX model...');
    modelPath = await downloadModel(config.onnx.modelUrl);
  }
  if (!modelPath) {
    // Don’t throw here if we’re allowed to skip on boot.
    if (config.skipOnnxLoadOnBoot) {
      console.warn('ONNX model not configured; running without a model.');
      return null;
    }
    throw new Error('No ONNX model configured.');
  }
  console.log('Loading ONNX model from', modelPath);
  session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['cpuExecutionProvider']
  });
  return session;
}

export function isModelReady() {
  return !!session;
}

// Run model or mock
export async function runInference(tensor) {
  // Mock mode returns deterministic fake logits (5 classes)
  if (config.mockInference) {
    const logits = new Float32Array([0.1, 0.2, 0.3, 0.1, 0.05]);
    return { data: logits };
  }
  if (!session) {
    // try late-load once when first inference happens
    await ensureSessionLoaded();
  }
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
