const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema({
  challengeTheme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChallengeTheme',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // 联系方式（不在前端展示）
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  // 活动照片（最多5张）
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // 投票相关
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // 状态
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // 审核信息
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNote: {
    type: String
  },
  // 排名
  rank: {
    type: Number
  },
  // 是否获奖
  isWinner: {
    type: Boolean,
    default: false
  },
  prizeLevel: {
    type: String,
    enum: ['first', 'second', 'third', 'participation']
  }
}, {
  timestamps: true
});

// 确保用户每个挑战只能提交一次
challengeSubmissionSchema.index({ challengeTheme: 1, user: 1 }, { unique: true });

// 投票索引
challengeSubmissionSchema.index({ 'voters.user': 1 });

// 排序索引
challengeSubmissionSchema.index({ votes: -1, createdAt: -1 });

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);