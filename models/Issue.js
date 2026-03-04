const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  title: String,
  issue: String,
  date: { type: Date, default: Date.now },
//   status: { type: String, enum: ['Open','Resolved'], default: 'Open' },
// resolvedAt: Date
});

module.exports = mongoose.model('Issue', issueSchema);