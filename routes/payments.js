const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Pack = require('../models/Pack');
const Payment = require('../models/Payment');

const router = express.Router();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { packId } = req.body;
    const user = await User.findById(req.userId);
    const pack = await Pack.findById(packId);

    if (!user || !pack) {
      return res.status(404).json({ success: false, message: 'User or pack not found' });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.userId,
      packId,
      amount: pack.price,
      currency: 'NGN',
      customerEmail: user.email,
      customerName: user.fullName,
      customerPhone: user.phoneNumber,
      metadata: {
        packName: pack.name,
        packLevel: pack.level
      }
    });

    await payment.save();

    // Initialize Paystack payment
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: user.email,
        amount: pack.price * 100, // Convert to kobo
        reference: payment._id.toString(),
        metadata: {
          userId: req.userId.toString(),
          packId: packId.toString(),
          packName: pack.name
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    payment.paystackReference = response.data.data.reference;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment initialized',
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
      paymentId: payment._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
});

// Verify payment
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    const paystackPayment = response.data.data;

    // Update payment record
    const payment = await Payment.findOne({ paystackReference: reference });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (paystackPayment.status === 'success') {
      payment.status = 'completed';
      payment.transactionId = paystackPayment.reference;
      payment.paidAt = new Date();
      await payment.save();

      // Update user's purchase history
      const user = await User.findById(payment.userId);
      user.purchases.push({
        packId: payment.packId,
        packName: payment.metadata.packName,
        amount: payment.amount,
        transactionId: paystackPayment.reference,
        status: 'completed',
        purchaseDate: new Date()
      });
      await user.save();

      // Update pack purchase count
      await Pack.findByIdAndUpdate(payment.packId, {
        $inc: { purchaseCount: 1 }
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          packId: payment.packId
        }
      });
    } else {
      payment.status = 'failed';
      payment.errorMessage = paystackPayment.status;
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        status: paystackPayment.status
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .populate('packId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

module.exports = router;