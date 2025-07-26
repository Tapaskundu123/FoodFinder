import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // ────────── Auth fields ──────────
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetOTP: {
    type: String,
    default: ''
  },
  resetOTPExpiredAt: {
    type: Date,
    default: Date.now
  },

  // ────────── Vendor (optional) ──────────
  stallName: {
    type: String
  },
  foodType: {
    type: String
  },
  city: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]   // [ lng, lat ]
    }
  }
});

UserSchema.index({ location: '2dsphere' });

export const UserModel = mongoose.model('User', UserSchema);
