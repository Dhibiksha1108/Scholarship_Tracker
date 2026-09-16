const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a scholarship title'],
      trim: true,
    },
    provider: {
      type: String,
      required: [true, 'Please add a provider name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    eligibility: {
      type: String,
      required: [true, 'Please add eligibility criteria'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add scholarship amount'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please add application deadline'],
    },
    website: {
      type: String,
      required: [true, 'Please add official website link'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category (e.g., Merit-based, Need-based, STEM)'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add target state (e.g. All India, Maharashtra, Karnataka)'],
      trim: true,
      default: 'All India',
    },
    level: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Please add eligible course/major name (e.g., B.Tech, M.Sc, All Courses)'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scholarship', ScholarshipSchema);
