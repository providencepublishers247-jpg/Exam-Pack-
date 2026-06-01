const express = require('express');
const Pack = require('../models/Pack');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all active packs
router.get('/', async (req, res) => {
  try {
    const packs = await Pack.find({ status: 'active' });
    res.json({
      success: true,
      packs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packs',
      error: error.message
    });
  }
});

// Get single pack
router.get('/:packId', async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.packId);
    if (!pack) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }
    res.json({
      success: true,
      pack
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pack',
      error: error.message
    });
  }
});

// Get packs by level
router.get('/level/:level', async (req, res) => {
  try {
    const packs = await Pack.find({
      level: req.params.level,
      status: 'active'
    });
    res.json({
      success: true,
      packs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packs',
      error: error.message
    });
  }
});

module.exports = router;