const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  packageNumber: { type: String, required: true },
  requirement: { type: String }, // Transport Requirement or Condition
  estimatedDeliveryTime: { type: String },
  distance: { type: Number },
  charges: { type: Number },
  deliveredStatus: { type: String, enum: ['Pending', 'In-Transit', 'Delivered', 'Cancelled'], default: 'Pending' },
  acceptStatus: { type: Boolean, default: false },
  assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },

  pickUp: {
    lat: Number,
    long: Number,
    location: String,
    doctorId: String, 
    businessName: String,
    docContact: String 
  },

  dropOff: {
    lat: Number,
    long: Number,
    location: String,
    mwanachiId: String,
    mwanachiName: String,
    receiverContact: String // For Support Page
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);