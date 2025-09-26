import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config.js';
import { v4 as uuidv4 } from 'uuid';

let s3 = null;
function getClient() {
  if (!s3) {
    s3 = new S3Client({ region: config.storage.region || 'us-east-1' });
  }
  return s3;
}

export async function storeImageIfConsented(buffer, mimetype) {
  if (!config.storage.enabled) return null;
  const Key = `consented/${new Date().toISOString().slice(0,10)}/${uuidv4()}` + (mimetype === 'image/png' ? '.png' : '.jpg');
  const client = getClient();
  await client.send(new PutObjectCommand({
    Bucket: config.storage.bucket,
    Key,
    Body: buffer,
    ContentType: mimetype,
  }));
  return { bucket: config.storage.bucket, key: Key };
}
