const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 粉丝留言模型
 * 用于存储华晨宇粉丝的留言和点赞数据
 */
const FanMessageSchema = new Schema({
  // 留言ID（用于前端识别）
  message_id: {
    type: Number,
    required: true,
    unique: true
  },
  // 粉丝昵称
  name: {
    type: String,
    required: true,
    trim: true
  },
  // 留言内容
  message: {
    type: String,
    required: true,
    trim: true
  },
  // 头像路径
  avatar: {
    type: String,
    required: true
  },
  // 点赞数量
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  // 是否启用（管理员可以控制显示/隐藏）
  is_active: {
    type: Boolean,
    default: true
  },
  // 排序权重（用于控制显示顺序）
  sort_order: {
    type: Number,
    default: 0
  },
  // 创建时间
  created_at: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
FanMessageSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
FanMessageSchema.index({ message_id: 1 });
FanMessageSchema.index({ is_active: 1, sort_order: 1 });

module.exports = mongoose.model('FanMessage', FanMessageSchema);