const Coupon = require('../models/Coupon');

// @desc    Get user coupons
// @route   GET /api/coupons/mycoupons
// @access  Private
const getMyCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ user: req.user._id })
      .populate('generatedFromOrder', '_id')
      .populate('usedInOrder', '_id createdAt');
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    // We only allow verifying live coupons. And it could belong to ANY user, or specific user.
    // The prompt says "if user uses that coupon code ...": assuming it's their coupon or any live coupon. Let's make it universal to whoever has the code.
    const coupon = await Coupon.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') }, status: 'live' });
    
    if (coupon) {
      res.json({ valid: true, amount: coupon.amount, code: coupon.code });
    } else {
      res.status(404);
      throw new Error('Invalid or already used coupon code');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCoupons,
  validateCoupon,
};
