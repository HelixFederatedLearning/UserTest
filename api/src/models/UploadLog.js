// api/src/models/UploadLog.js
import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    prob: { type: Number, required: true }
  },
  { _id: false }
);

const UploadLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filenames: { type: [String], default: [] },
    consent: { type: Boolean, default: false },
    predictions: { type: [PredictionSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'uploadlogs' }
);

export const UploadLog = mongoose.model('UploadLog', UploadLogSchema);
