const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'MenuItem',
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['UPI', 'Cash','Coupon'],
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['placed', 'baking', 'prepared', 'ready_to_pickup', 'delivered', 'completed', 'cancelled'],
      default: 'placed',
    },
    consumedCouponCode: {
      type: String,
    },
    issuedCouponCode: {
      type: String,
    },
    orderNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Counter = require('./Counter');

orderSchema.pre('save', async function () {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    let counter;
    let retries = 3;
    while (retries > 0) {
      try {
        counter = await Counter.findOneAndUpdate(
          { dateStr },
          { $inc: { seq: 1 } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        break;
      } catch (err) {
        if (err.code === 11000) {
          retries--;
          if (retries === 0) throw err;
        } else {
          throw err;
        }
      }
    }
    this.orderNumber = counter.seq;
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
