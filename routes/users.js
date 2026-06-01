const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('purchases.packId')
      .populate('downloadHistory.packId');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        phoneNumber,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const completedPurchases = user.purchases.filter(p => p.status === 'completed');
    const stats = {
      totalPurchases: completedPurchases.length,
      totalSpent: completedPurchases.reduce((sum, p) => sum + p.amount, 0),
      totalDownloads: user.downloadHistory.length,
      memberSince: user.createdAt
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

module.exports = router;