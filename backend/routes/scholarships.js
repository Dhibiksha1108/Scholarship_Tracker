const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all scholarships with search, filter, and pagination
// @route   GET /api/scholarships
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      minAmount,
      level,
      course,
      eligibility,
      status,
      state,
      page = 1,
      limit = 6,
    } = req.query;

    // Build query object
    const query = {};

    // Search query (matches title, provider, description, course, or eligibility)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (category) {
      query.category = category;
    }

    if (minAmount) {
      query.amount = { $gte: Number(minAmount) };
    }

    if (level) {
      query.level = level;
    }

    if (course) {
      query.course = course;
    }

    if (eligibility) {
      query.eligibility = { $regex: eligibility, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (state) {
      query.state = state;
    }

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch matching data
    const total = await Scholarship.countDocuments(query);
    const scholarships = await Scholarship.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    // Get statistics for the dashboard
    // We can run these quick counts to support dashboard cards
    const totalCount = await Scholarship.countDocuments();
    const openCount = await Scholarship.countDocuments({ status: 'Open' });
    const closedCount = await Scholarship.countDocuments({ status: 'Closed' });
    const studentsCount = await User.countDocuments({ role: 'Student' });
    const wishlistCount = await Wishlist.countDocuments();

    res.status(200).json({
      success: true,
      count: scholarships.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      stats: {
        total: totalCount,
        open: openCount,
        closed: closedCount,
        students: studentsCount,
        wishlists: wishlistCount,
      },
      data: scholarships,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single scholarship
// @route   GET /api/scholarships/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a scholarship
// @route   POST /api/scholarships
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      provider,
      description,
      eligibility,
      amount,
      deadline,
      website,
      category,
      country,
      level,
      course,
      state,
      status,
    } = req.body;

    if (
      !title ||
      !provider ||
      !description ||
      !eligibility ||
      !amount ||
      !deadline ||
      !website ||
      !category ||
      !course ||
      !state
    ) {
      return res.status(400).json({ success: false, message: 'Please include all required fields (Scholarship Name, Provider, Description, Eligibility, Amount, Deadline, Website, Category, Course, State)' });
    }

    const scholarship = await Scholarship.create({
      title,
      provider,
      description,
      eligibility,
      amount,
      deadline,
      website,
      category,
      country: country || 'India',
      level: level || 'Undergraduate',
      course,
      state,
      status: status || 'Open',
    });

    res.status(201).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a scholarship
// @route   PUT /api/scholarships/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    let scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }

    scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a scholarship
// @route   DELETE /api/scholarships/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }

    await scholarship.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Scholarship deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
