const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, admin, createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, admin, updateMenuItem)
  .delete(protect, admin, deleteMenuItem);

module.exports = router;
