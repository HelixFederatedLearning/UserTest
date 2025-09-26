import sharp from 'sharp';
import ort from 'onnxruntime-node';

/**
 * Preprocess an image buffer into a 1x3x224x224 float32 tensor normalized to [0,1].
 * Adjust to match your model's expected input.
 */
export async function preprocessToTensor(buffer) {
  const size = 224;

  // Decode, remove alpha, resize, and get raw RGB bytes
  const pipeline = sharp(buffer)
    .removeAlpha()
    .resize(size, size, { fit: 'cover' });

  const { data, info } = await pipeline
    .raw() // <-- returns raw RGB (3 channels) bytes
    .toBuffer({ resolveWithObject: true });

  // Ensure we got RGB channels
  const channels = info.channels || 3;
  if (channels !== 3) {
    throw new Error(`Expected 3 channels (RGB) but got ${channels}`);
  }

  // Normalize to [0,1]
  const float = new Float32Array(size * size * 3);
  for (let i = 0; i < data.length; i++) {
    float[i] = data[i] / 255.0;
  }

  // Convert HWC -> CHW
  const chw = new Float32Array(size * size * 3);
  const channelSize = size * size;
  let src = 0;
  for (let i = 0; i < size * size; i++) {
    const r = float[src++];
    const g = float[src++];
    const b = float[src++];
    chw[i] = r;
    chw[i + channelSize] = g;
    chw[i + 2 * channelSize] = b;
  }

  return new ort.Tensor('float32', chw, [1, 3, size, size]);
}
