const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.user._id })
      .populate('scholarshipId')
      .sort({ savedAt: -1 });

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      data: wishlistItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add scholarship to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { scholarshipId } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({ success: false, message: 'Please provide scholarshipId' });
    }

    // Check if already in wishlist
    const exists = await Wishlist.findOne({
      userId: req.user._id,
      scholarshipId,
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Scholarship already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({
      userId: req.user._id,
      scholarshipId,
    });

    // Populate the scholarship details before returning
    const populatedItem = await Wishlist.findById(wishlistItem._id).populate('scholarshipId');

    res.status(201).json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update wishlist item status (applied)
// @route   PUT /api/wishlist/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findById(req.params.id);

    if (!wishlistItem) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    // Ensure user owns this wishlist item
    if (wishlistItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { applied } = req.body;
    wishlistItem.applied = applied !== undefined ? applied : !wishlistItem.applied;
    await wishlistItem.save();

    const populatedItem = await Wishlist.findById(wishlistItem._id).populate('scholarshipId');

    res.status(200).json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Remove scholarship from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findById(req.params.id);

    if (!wishlistItem) {
      // Also try to find by scholarshipId for easy deletion from cards
      const wishlistItemByScholarship = await Wishlist.findOne({
        userId: req.user._id,
        scholarshipId: req.params.id
      });
      
      if (wishlistItemByScholarship) {
        await wishlistItemByScholarship.deleteOne();
        return res.status(200).json({
          success: true,
          data: {},
          message: 'Scholarship removed from wishlist',
        });
      }

      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    // Ensure user owns this wishlist item
    if (wishlistItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await wishlistItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Scholarship removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
