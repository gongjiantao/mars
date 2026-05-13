const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 守护者留言模型
 * 用于反网络暴力守护计划的留言墙功能
 */
const EncouragementSchema = new Schema({
  // 用户ID（如果用户已登录）
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // 匿名ID
  anonymous_id: {
    type: String,
    required: true
  },
  // 留言内容
  content: {
    type: String,
    required: true,
    trim: true
  },
  // 留言类型
  type: {
    type: String,
    enum: ['encouragement', 'support', 'advice', 'experience', 'other'],
    default: 'encouragement'
  },
  // 关联的案例ID（如果有）
  case_id: {
    type: Schema.Types.ObjectId,
    ref: 'AntiViolenceCase',
    default: null
  },
  // 点赞数
  likes: {
    type: Number,
    default: 0
  },
  // 点赞用户
  liked_by: [String],
  // 是否被管理员推荐
  is_featured: {
    type: Boolean,
    default: false
  },
  // 是否通过审核
  is_approved: {
    type: Boolean,
    default: true
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
  // 背景颜色（用于前端展示）
  background_color: {
    type: String,
    default: '#FFFFFF'
  },
  // 字体颜色（用于前端展示）
  text_color: {
    type: String,
    default: '#000000'
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
  // IP地址哈希（用于防止滥用）
  ip_hash: {
    type: String,
    select: false // 默认不返回
  }
});

// 更新时自动更新updated_at字段
EncouragementSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
EncouragementSchema.index({ created_at: -1 });
EncouragementSchema.index({ is_featured: 1 });
EncouragementSchema.index({ likes: -1 });
EncouragementSchema.index({ content: 'text' });

module.exports = mongoose.model('Encouragement', EncouragementSchema);