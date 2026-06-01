const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Nursery', 'Lower Primary', 'Higher Primary'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  features: [String],
  fileSize: String,
  downloadUrl: String,
  fileName: String,
  filePath: String,
  category: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pack', packSchema);