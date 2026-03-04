const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  notificationType: String,
  title: String,
  text: String,
  timeSent: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);