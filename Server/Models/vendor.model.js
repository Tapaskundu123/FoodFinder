import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema({
  userId: 
  { type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
   },
  stallName: 
    { type: String,
    required: true 
    },
  foodType: 
  { type: String,
     required: true 
    },
  city: 
    { type: String,
     required: true
     },
  phoneNumber:
     { type: String,
     required: true
     },
  address:
   { type: String, 
    required: true 
    }, // For customer access
  location:
     {
      type: { type: String, enum: ['Point'],
         required: true },
         coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
});
vendorSchema.index({ location: '2dsphere' });
export const VendorModel = mongoose.model('Vendor', vendorSchema);
