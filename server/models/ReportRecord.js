const mongoose = require('mongoose');

const reportRecordSchema = new mongoose.Schema({
  // 举报内容
  content: {
    type: String,
    required: true
  },
  // 举报类型
  type: {
    type: String,
    required: true,
    enum: ['网络霸凌', '恶意骚扰', '仇恨言论', '虚假信息', '其他']
  },
  // 举报平台
  platform: {
    type: String,
    default: '未指定'
  },
  // 相关URL
  url: {
    type: String,
    default: ''
  },
  // 详细描述
  description: {
    type: String,
    default: ''
  },
  // 举报用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // 游客会话ID
  sessionId: {
    type: String,
    required: false
  },
  // 处理状态
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'rejected'],
    default: 'pending'
  },
  // 处理结果
  resolution: {
    type: String,
    default: ''
  },
  // 处理时间
  processedAt: {
    type: Date
  },
  // 处理人员ID
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 检测结果
  detectionResult: {
    hasSensitiveWords: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: null
    },
    detectedWords: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// 创建索引
reportRecordSchema.index({ userId: 1 });
reportRecordSchema.index({ sessionId: 1 });
reportRecordSchema.index({ status: 1 });
reportRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReportRecord', reportRecordSchema);