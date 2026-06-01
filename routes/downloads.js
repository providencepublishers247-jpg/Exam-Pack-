const express = require('express');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Pack = require('../models/Pack');

const router = express.Router();

// Download pack file
router.get('/pack/:packId', auth, async (req, res) => {
  try {
    const { packId } = req.params;
    const user = await User.findById(req.userId);
    const pack = await Pack.findById(packId);

    if (!pack) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    // Check if user has purchased this pack
    const hasPurchased = user.hasPurchased(packId);
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'You must purchase this pack to download it'
      });
    }

    // Check if file exists
    const filePath = path.join(__dirname, '..', pack.filePath || `/uploads/${pack.fileName}`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Log download
    user.downloadHistory.push({
      packId,
      fileName: pack.fileName,
      downloadDate: new Date()
    });
    await user.save();

    // Update pack download count
    await Pack.findByIdAndUpdate(packId, {
      $inc: { downloadCount: 1 }
    });

    // Send file
    res.download(filePath, pack.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
});

// Get download history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('downloadHistory.packId', 'name level');

    res.json({
      success: true,
      downloadHistory: user.downloadHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch download history',
      error: error.message
    });
  }
});

// Get purchased packs
router.get('/purchased-packs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('purchases.packId');

    const purchasedPacks = user.purchases
      .filter(p => p.status === 'completed')
      .map(p => ({
        ...p.packId.toObject(),
        purchaseDate: p.purchaseDate,
        transactionId: p.transactionId
      }));

    res.json({
      success: true,
      purchasedPacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchased packs',
      error: error.message
    });
  }
});

module.exports = router;