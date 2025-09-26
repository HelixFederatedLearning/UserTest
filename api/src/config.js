// import dotenv from 'dotenv';
// dotenv.config();

// export const config = {
//   port: process.env.PORT || 4000,
//   mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/drapp',
//   jwtSecret: process.env.JWT_SECRET || 'devsecret',
//   corsOrigin: process.env.CORS_ALLOWED_ORIGIN || '*',
//   onnx: {
//     modelUrl: process.env.ONNX_MODEL_URL || '',
//     localPath: process.env.ONNX_MODEL_PATH || '',
//     inputName: process.env.MODEL_INPUT_NAME || 'input',
//     outputName: process.env.MODEL_OUTPUT_NAME || 'output',
//   },
//   storage: {
//     enabled: process.env.ENABLE_CLOUD_STORAGE === 'true',
//     bucket: process.env.S3_BUCKET || '',
//     region: process.env.AWS_REGION || '',
//   }
// };
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/drapp',
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  corsOrigin: process.env.CORS_ALLOWED_ORIGIN || '*',
  onnx: {
    modelUrl: process.env.ONNX_MODEL_URL || '',
    localPath: process.env.ONNX_MODEL_PATH || '',
    inputName: process.env.MODEL_INPUT_NAME || 'input',
    outputName: process.env.MODEL_OUTPUT_NAME || 'output',
  },
  storage: {
    enabled: process.env.ENABLE_CLOUD_STORAGE === 'true',
    bucket: process.env.S3_BUCKET || '',
    region: process.env.AWS_REGION || '',
  },
  // NEW: dev flags
  mockInference: process.env.MOCK_INFERENCE === 'true',      // return fake predictions
  skipOnnxLoadOnBoot: true                                   // don’t block server start on missing model
};

console.log(
  'MONGODB_URI(app)=',
  (process.env.MONGODB_URI || '').replace(/:\/\/.*@/, '://<redacted>@')
);
