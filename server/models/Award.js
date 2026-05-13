const mongoose = require('mongoose');

/**
 * 获奖记录模型
 * 用于时间轴组件展示歌手的获奖历史
 */
const AwardSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  award: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: '音乐'
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: '/img/awards/trophy.svg'
  },
  related_work: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新updated_at字段
AwardSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
AwardSchema.index({ year: -1 });
AwardSchema.index({ date: -1 });

module.exports = mongoose.model('Award', AwardSchema);