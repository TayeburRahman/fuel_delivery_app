const mongoose = require("mongoose");
 
const { Schema, model } = mongoose;

const locationSchema = new Schema({
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    // required: true,
  },
});

const DriverSchema = new Schema(
  {
    authId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Auth",
    },  
    name: {
      type: String,
      required: false,
    }, 
    email: {
      type: String,
      required: false,
    }, 
    phone_number: {
      type: String,
      required: false,
    },
    drivingLicenseNumber: {
      type: String,
      required: false,
    },
    drivingLicenseExpireDate: {
      type: Date,
      required: false,
    },
    profile_image: {
      type: String,
      default:
        'https://res.cloudinary.com/arafatleo/image/upload/v1720600946/images_1_dz5srb.png',
    },
    cover_image: {
      type: String,
      default:
        'https://res.cloudinary.com/arafatleo/image/upload/v1720600946/images_1_dz5srb.png',
    },
    licenseFrontImage: {
      type: String,
      required: false,
    },
    licenseBackImage: {
      type: String,
      required: false,
    },
    vehicleRegistrationNumber: {
      type: String,
      required: false,
    },
    vehicleDocumentImage: {
      type: String,
      required: false,
    },
    vehicleImage: {
      type: String,
      required: false,
    },
    vehicleSize: {
      type: String,
      // required: false,
    },
    vehicleType: {
      type: String,
      // required: false,
    },
    cargoCapacity: {
      type: String,
      // required: false,
    },
    services: {
      type: [String],
      required: false,
    },
    kmForPrice: {
      type: String,
      required: false,
    },
    bankAccountNumber: {
      type: String,
      required: false,
    },
    bankName: {
      type: String,
      required: false,
    },
    routingNumber: {
      type: String,
      required: false,
    },
    accountHolderName: {
      type: String,
      required: false,
    }, 
    paypalEmail: {
      type: String,
    },
    current_trip_user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }, 
    location: {
      type: locationSchema,
    },
  },
  {
    timestamps: true,
  },
);
 

const Driver = mongoose.model("Driver", DriverSchema);

module.exports = Driver;
