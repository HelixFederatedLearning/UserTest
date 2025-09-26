# Diabetic Retinopathy Test App — Starter

This is a minimal starter kit.

## Stack
- **Frontend**: React + Tailwind (Vite)
- **Backend**: Node.js + Express
- **DB**: MongoDB Atlas (Mongoose)
- **Inference**: onnxruntime-node
- **Storage (optional)**: S3

## Setup

### Backend
```bash
cd api
npm install
cp ../.env.example .env
# edit .env with your values
npm run dev
```

### Frontend
```bash
cd web
npm install
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev
```

## Environment (.env in /api)
See `.env.example` for full list. Key ones:
- `MONGODB_URI=` MongoDB Atlas connection string
- `JWT_SECRET=` secret for JWT
- `ONNX_MODEL_URL=` public URL to your ONNX model OR
- `ONNX_MODEL_PATH=` absolute file path if local
- `MODEL_INPUT_NAME=` input tensor name (default: input)
- `MODEL_OUTPUT_NAME=` output tensor name (default: output)
- `ENABLE_CLOUD_STORAGE=true` to enable S3 uploads when consent = yes
- `S3_BUCKET=your-bucket`
- `AWS_REGION=us-east-1`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `CORS_ALLOWED_ORIGIN=http://localhost:5173` (vite default)

## Notes
- Upload endpoint accepts up to 2 images named `images` (FormData). A boolean `consent` field controls whether to upload to S3.
- Preprocessing resizes to 224x224, RGB, normalizes to [0,1], and packs to NCHW. Adjust to your model.
- Postprocess assumes 5-class DR logits. Change labels & logic to match your model.
- All uploads are logged with user, timestamp, predictions, and consent.
- Export CSV available at `/api/logs/me/export`.
