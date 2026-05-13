const mongoose = require('mongoose');

const detectionRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sessionId: {
    type: String,
    required: false // 对于未登录用户，可以使用sessionId
  },
  detectionCount: {
    type: Number,
    default: 0
  },
  lastDetectionTime: {
    type: Date,
    default: Date.now
  },
  detectionHistory: [{
    content: {
      type: String,
      required: true
    },
    detected: {
      type: Boolean,
      required: true
    },
    detectedWords: {
      type: [String],
      default: []
    },
    type: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 创建复合索引
detectionRecordSchema.index({ userId: 1 });
detectionRecordSchema.index({ sessionId: 1 });
detectionRecordSchema.index({ userId: 1, sessionId: 1 });

module.exports = mongoose.model('DetectionRecord', detectionRecordSchema);