// // api/src/models/UploadLog.js
// import mongoose from 'mongoose';

// const PredictionSchema = new mongoose.Schema(
//   {
//     label: { type: String, required: true },
//     prob: { type: Number, required: true }
//   },
//   { _id: false }
// );

// const UploadLogSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     filenames: { type: [String], default: [] },
//     consent: { type: Boolean, default: false },
//     predictions: { type: [PredictionSchema], default: [] },
//     createdAt: { type: Date, default: Date.now }
//   },
//   { collection: 'uploadlogs' }
// );

// export const UploadLog = mongoose.model('UploadLog', UploadLogSchema);
import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    prob:  { type: Number, required: true },
  },
  { _id: false }
);

const UploadLogSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    filenames:  { type: [String], default: [] },  // local runs may be []
    consent:    { type: Boolean, default: false },
    predictions:{ type: [PredictionSchema], default: [] },
    // optional: 'local' | 'server' if you want to distinguish sources later
    source:     { type: String, enum: ['local', 'server'], default: 'local' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // provides createdAt
    collection: 'uploadlogs', // pin collection so both routes use SAME collection
  }
);

export default mongoose.model('UploadLog', UploadLogSchema);