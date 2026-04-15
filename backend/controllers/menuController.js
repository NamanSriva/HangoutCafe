const MenuItem = require('../models/MenuItem');

// @desc    Fetch all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({});
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404);
      throw new Error('Menu item not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res, next) => {
  try {
    const { name, category, description, price, imageUrl, inventoryCount } = req.body;

    const item = new MenuItem({
      name,
      category,
      description,
      price,
      imageUrl,
      inventoryCount,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res, next) => {
  try {
    const { name, category, description, price, imageUrl, inventoryCount, isAvailable } = req.body;

    const item = await MenuItem.findById(req.params.id);

    if (item) {
      item.name = name || item.name;
      item.category = category || item.category;
      item.description = description || item.description;
      item.price = price || item.price;
      item.imageUrl = imageUrl || item.imageUrl;
      item.inventoryCount = inventoryCount !== undefined ? inventoryCount : item.inventoryCount;
      item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404);
      throw new Error('Menu item not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (item) {
      await item.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404);
      throw new Error('Menu item not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
