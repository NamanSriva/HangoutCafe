const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyCoupons, validateCoupon } = require('../controllers/couponController');

router.route('/mycoupons').get(protect, getMyCoupons);
router.route('/validate').post(protect, validateCoupon);

module.exports = router;
