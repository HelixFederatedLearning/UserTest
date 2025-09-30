// api/src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    // add fields like email, role, etc., later
  },
  { collection: 'users', timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
