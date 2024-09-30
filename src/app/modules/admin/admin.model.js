const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../../../config");

const { Schema, model } = mongoose;

const AdminSchema = new Schema(
  {
    authId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Auth",
    },  
    name: {
      type: String,
      required: true,
    }, 
    email: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      default:
        "https://res.cloudinary.com/arafatleo/image/upload/v1720600946/images_1_dz5srb.png",
    }, 
    cover_image:{
      type: String,
      default:
        "https://res.cloudinary.com/arafatleo/image/upload/v1720600946/images_1_dz5srb.png",
    },
    phone_number: {
      type: String,
      required: true,
    }, 
    address: {
      type: String,
    }, 
    gender: {
      type: String, 
    },
    age: {
      type: String,
    }, 
    location: {
      type: String,
    },
    date_of_birth: {
      type: Date,
    }, 
  },
  {
    timestamps: true,
  }
); 

// Statics
const Admin = model("Admin", AdminSchema);

module.exports = Admin;
