const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
  balance: { type: Number, default: 0 },
  trend: [Number], // Store weekly/monthly earnings for the graph
  recentPayouts: [{
    payName: String,
    datePayed: { type: Date, default: Date.now },
    ammount: Number
  }],
  transactionHistory: [{
    transType: { type: String, enum: ['Credit', 'Debit'] },
    ammount: Number,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Finance', financeSchema);