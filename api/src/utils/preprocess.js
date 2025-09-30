// api/src/utils/preprocess.js
import sharp from 'sharp';
import ort from 'onnxruntime-node'; // only for Tensor class (works even when runtime is WASM)

const SIZE = 224; // change if your model expects a different resolution

/**
 * Preprocess an image buffer into a Float32 tensor.
 * Defaults to RGB, [0..1], NCHW, 224x224.
 * Adjust SIZE and normalization if your model differs.
 */
export async function preprocessToTensor(buffer) {
  const size = SIZE;

  // Decode, remove alpha, resize, and get raw RGB bytes
  const pipeline = sharp(buffer)
    .removeAlpha()
    .resize(size, size, { fit: 'cover' });

  const { data, info } = await pipeline
    .raw() // returns raw RGB (3 channels) bytes
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels || 3;
  if (channels !== 3) {
    throw new Error(`Expected 3 channels (RGB) but got ${channels}`);
  }

  // Normalize to [0,1]
  const float = new Float32Array(size * size * 3);
  for (let i = 0; i < data.length; i++) {
    float[i] = data[i] / 255.0;
  }

  // If you need mean/std normalization, apply here:
  // const mean = [0.485, 0.456, 0.406];
  // const std  = [0.229, 0.224, 0.225];

  // Convert HWC -> CHW (and optionally apply mean/std)
  const chw = new Float32Array(size * size * 3);
  const channelSize = size * size;
  let src = 0;
  for (let i = 0; i < size * size; i++) {
    const r = float[src++];
    const g = float[src++];
    const b = float[src++];
    // chw[i]              = (r - mean[0]) / std[0];
    // chw[i + channelSize]= (g - mean[1]) / std[1];
    // chw[i+2*channelSize]= (b - mean[2]) / std[2];
    chw[i] = r;
    chw[i + channelSize] = g;
    chw[i + 2 * channelSize] = b;
  }

  return new ort.Tensor('float32', chw, [1, 3, size, size]); // NCHW
}
