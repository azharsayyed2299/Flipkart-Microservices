const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['COD', 'Card', 'UPI', 'NetBanking'], required: true },
  transactionId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['Pending', 'Success', 'Failed', 'Refunded'], default: 'Pending' },
  paymentGateway: String,
  metadata: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
