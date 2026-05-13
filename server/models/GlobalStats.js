const mongoose = require('mongoose');

const globalStatsSchema = new mongoose.Schema({
  // 统计类型标识符
  type: {
    type: String,
    required: true,
    unique: true
  },
  // 统计值
  count: {
    type: Number,
    default: 0
  },
  // 最后更新时间
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // 额外的统计数据
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 创建索引
globalStatsSchema.index({ type: 1 });

module.exports = mongoose.model('GlobalStats', globalStatsSchema);