const mongoose = require('mongoose');

const challengeThemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  month: {
    type: String,
    required: true // 格式: "2024-01"
  },
  year: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxSubmissions: {
    type: Number,
    default: 1000 // 最大参与人数
  },
  currentSubmissions: {
    type: Number,
    default: 0
  },
  rules: [{
    type: String
  }],
  prizes: [{
    rank: String,
    description: String,
    count: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 确保每个月只有一个活跃的挑战
challengeThemeSchema.index({ month: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeTheme', challengeThemeSchema);