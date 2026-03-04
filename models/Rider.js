const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  // Registration Data
  userImg: { type: String },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  phnNum: { type: String, required: true },
  nationalId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Security: hide by default
  vehicleType: { type: String },
  plateNumber: { type: String },
  drivingLicenseNo: { type: String },
  lincesExpiryDate: { type: Date },

  // Status & Verification
  idVerified: { type: Boolean, default: false },
  lincesVerified: { type: Boolean, default: false },
  approvedStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  dateApproved: { type: Date },
  
  // Dashboard & Real-time Info
  onDuty: { type: Boolean, default: false },
  currentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  balance: { type: Number, default: 0 },
  ordersMade: { type: Number, default: 0 },

  // Extra Profile Info (from updateUserInformation)
  residencialAddress: { type: String },
  emergencyContact: { type: String },
  lastSignedIn: { type: Date },
  // Account State (admin control)
accountStatus: {
  type: String,
  enum: ['Active', 'Suspended', 'Locked'],
  default: 'Active'
},
statusReason: { type: String, default: '' },

// Verification metadata
verifiedByAdmin: { type: Boolean, default: false },
verifiedAt: { type: Date }
 
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);


 // isLoggedIn: { type: Boolean, default: false }