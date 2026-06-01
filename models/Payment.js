const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'bank-transfer', 'wallet'],
    default: 'paystack'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paystackReference: String,
  customerEmail: {
    type: String,
    required: true
  },
  customerName: String,
  customerPhone: String,
  metadata: {
    packName: String,
    packLevel: String
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 60 * 1000) // 30 minutes expiry
  }
});

module.exports = mongoose.model('Payment', paymentSchema);