const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
  dateStr: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    required: true,
    default: 100,
  },
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
