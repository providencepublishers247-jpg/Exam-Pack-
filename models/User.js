const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  purchases: [
    {
      packId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pack'
      },
      packName: String,
      amount: Number,
      purchaseDate: {
        type: Date,
        default: Date.now
      },
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      }
    }
  ],
  downloadHistory: [
    {
      packId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pack'
      },
      downloadDate: {
        type: Date,
        default: Date.now
      },
      fileName: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user has purchased a pack
userSchema.methods.hasPurchased = function (packId) {
  return this.purchases.some(
    purchase => purchase.packId.toString() === packId.toString() && purchase.status === 'completed'
  );
};

module.exports = mongoose.model('User', userSchema);