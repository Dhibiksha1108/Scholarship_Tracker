const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true,
  },
  applied: {
    type: Boolean,
    default: false,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only wishlist a scholarship once
WishlistSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
