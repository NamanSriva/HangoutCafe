const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, totalPrice, paymentMethod, isPaid, couponCode } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      let finalPrice = totalPrice;
      let appliedCoupon = null;

      // Handle Coupon verification
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: { $regex: new RegExp(`^${couponCode}$`, 'i') }, status: 'live' });
        if (!coupon) {
          res.status(400);
          throw new Error('Invalid or expired coupon code');
        }
        appliedCoupon = coupon;
        // Simply reduce the price dynamically. If it goes below 0, mark as 0.
        finalPrice = Math.max(0, finalPrice - coupon.amount);
      }

      const isFullyPaidByCoupon = appliedCoupon && finalPrice === 0;
const isUPI = paymentMethod === 'UPI';

const order = new Order({
  orderItems,
  user: req.user._id,
  totalPrice: finalPrice,
  paymentMethod,
  isPaid: isFullyPaidByCoupon || isUPI,
  paidAt: (isFullyPaidByCoupon || isUPI) ? Date.now() : null,
  consumedCouponCode: appliedCoupon ? appliedCoupon.code : undefined,
});

      const createdOrder = await order.save();

      // If coupon was applied, mark it as used and link to order
      if (appliedCoupon) {
        appliedCoupon.status = 'used';
        appliedCoupon.usedInOrder = createdOrder._id;
        await appliedCoupon.save();
      }

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order from user end
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to cancel this order');
      }
      
      if (['prepared', 'ready_to_pickup', 'delivered', 'completed'].includes(order.status)) {
        res.status(400);
        throw new Error('Order has already progressed too far to be cancelled');
      }

      // Check 2 minute limit
      const orderAgeMinutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
      if (orderAgeMinutes > 2 && !req.user.isAdmin) {
        res.status(400);
        throw new Error('Cancel time limit (2 minutes) has expired');
      }

      order.status = 'cancelled';
      const updatedOrder = await order.save();

      // IF order was paid, generate refund coupon and email user
      let couponData = null;
      if (order.isPaid) {
        // Generate a random 8-char code
        const codeSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
        const fullCode = `REFUND-${codeSuffix}`;
        
        const newCoupon = await Coupon.create({
          code: fullCode,
          amount: order.totalPrice,
          user: order.user._id,
          generatedFromOrder: order._id,
        });
        
        couponData = fullCode;

        // EJS template and Transporter
        const templatePath = path.join(__dirname, '../views', 'coupon.ejs');
        
        // Also tag the order with the issued coupon
        order.issuedCouponCode = fullCode;
        await order.save();
        

// inside cancelOrder after ejs.renderFile

ejs.renderFile(templatePath, {
  userName: order.user.name.split(' ')[0],
  orderId: order._id.toString().slice(-6).toUpperCase(),
  amount: order.totalPrice.toFixed(2),
  couponCode: fullCode
}, async (err, data) => {
  if (err) {
    console.error("EJS render error:", err.message);
    return; // stop here
  }

  try {
    await transporter.sendMail({
      from: '"Hangout Cafe" <namanbuss24@gmail.com>',
      to: order.user.email,
      subject: 'Your Refund Coupon Code',
      html: data
    });

    console.log('✅ Refund email sent');
  } catch (mailError) {
    console.error('❌ Mail failed:', mailError.message);
    // IMPORTANT: do NOT throw error
  }
});
      }

      // Return both order and injected flag for testing feedback if needed
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res, next) => {
  try {
    // Total Sales (only for non-cancelled orders)
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalSales = orders.reduce((acc, item) => acc + item.totalPrice, 0);

    // Orders Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Active Menu Items
    const activeItems = await MenuItem.countDocuments({});

    // New Customers (registered today)
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startOfToday },
      isAdmin: false
    });

    // Total Orders (all time)
    const totalOrders = await Order.countDocuments({});

    // Total Users (all time, customers only)
    const totalUsers = await User.countDocuments({ isAdmin: false });

    // Monthly Revenue Aggregation (Current Year)
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Yearly Revenue Aggregation
    const yearlyRevenue = await Order.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } },
      },
      {
        $group: {
          _id: { $year: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format monthly data for charts (ensure all months exist)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthNames.map((name, index) => {
      const found = monthlyRevenue.find(m => m._id === index + 1);
      return { name, revenue: found ? found.revenue : 0 };
    });

    // Format yearly data
    const formattedYearly = yearlyRevenue.map(y => ({
      name: y._id.toString(),
      revenue: y.revenue
    }));

    res.json({
      totalSales,
      ordersToday,
      activeItems,
      newCustomers,
      totalOrders,
      totalUsers,
      monthlySales: formattedMonthly,
      yearlySales: formattedYearly
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder,
  getOrderStats,
};
