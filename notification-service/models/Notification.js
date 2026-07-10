const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['order_placed', 'order_update', 'payment', 'promotional'], required: true },
  title: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  orderId: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
