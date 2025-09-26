import mongoose from 'mongoose';

const uploadLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  filenames: [{ type: String }],
  consent: { type: Boolean, default: false },
  predictions: [{ type: Object }],
  createdAt: { type: Date, default: Date.now }
});

export const UploadLog = mongoose.model('UploadLog', uploadLogSchema);
