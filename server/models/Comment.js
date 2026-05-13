const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 评论模型
 * 用于火星树洞（匿名社区）的评论
 */
const CommentSchema = new Schema({
  // 关联的帖子ID
  post_id: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  // 父评论ID（用于回复评论）
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // 评论层级
  level: {
    type: Number,
    default: 0 // 0表示直接回复帖子，1表示回复评论，以此类推
  },
  // 匿名ID（UUID）
  anonymous_id: {
    type: String,
    required: true
  },
  // 实际用户ID（如果用户已登录）
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // 是否匿名
  is_anonymous: {
    type: Boolean,
    default: true
  },
  // 评论内容
  content: {
    type: String,
    required: true,
    trim: true
  },
  // 评论图片
  image: {
    url: String,
    width: Number,
    height: Number
  },
  // 情绪标签
  emotion_tag: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'excited', 'worried', 'confused', 'neutral'],
    default: 'neutral'
  },
  // 点赞数
  likes: {
    type: Number,
    default: 0
  },
  // 点赞用户（匿名ID列表）
  liked_by: [String],
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
  }
});

// 更新时自动更新updated_at字段
CommentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
CommentSchema.index({ post_id: 1, created_at: -1 });
CommentSchema.index({ parent_id: 1 });
CommentSchema.index({ anonymous_id: 1 });
CommentSchema.index({ content: 'text' });

module.exports = mongoose.model('Comment', CommentSchema);