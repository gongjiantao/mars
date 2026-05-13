const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 帖子模型
 * 用于火星树洞（匿名社区）的帖子
 */
const PostSchema = new Schema({
  // 匿名ID（UUID）
  anonymous_id: {
    type: String,
    required: true,
    index: true
  },
  // 实际用户ID（如果用户已登录）
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // 帖子内容
  content: {
    type: String,
    required: true,
    trim: true
  },
  // 帖子图片（可多张）
  images: [{
    url: String,
    width: Number,
    height: Number,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  // 情绪标签
  emotion_tag: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'excited', 'worried', 'confused', 'neutral'],
    default: 'neutral'
  },
  // 标签
  tags: [String],
  // 点赞数
  likes: {
    type: Number,
    default: 0
  },
  // 点赞用户（匿名ID列表）
  liked_by: [String],
  // 评论数
  comment_count: {
    type: Number,
    default: 0
  },
  // 是否包含敏感内容
  has_sensitive_content: {
    type: Boolean,
    default: false
  },
  // 敏感内容类型
  sensitive_content_type: {
    type: String,
    enum: [null, 'emotional', 'violence', 'mixed'],
    default: null
  },
  // 是否已审核
  is_reviewed: {
    type: Boolean,
    default: false
  },
  // 帖子状态
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  // 是否被举报
  is_reported: {
    type: Boolean,
    default: false
  },
  // 举报原因
  report_reasons: [{
    reason: String,
    reported_at: {
      type: Date,
      default: Date.now
    },
    reporter_id: String
  }],
  // 是否被删除
  is_deleted: {
    type: Boolean,
    default: false
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
  },
  // IP地址（仅存储哈希值，用于防止滥用）
  ip_hash: {
    type: String,
    select: false // 默认不返回
  },
  // 设备信息哈希（用于防止滥用）
  device_hash: {
    type: String,
    select: false // 默认不返回
  },
  // 聊天室ID（如果有关联的聊天室）
  chat_room_id: {
    type: String,
    default: null
  }
});

// 更新时自动更新updated_at字段
PostSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
PostSchema.index({ created_at: -1 });
PostSchema.index({ emotion_tag: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', PostSchema);