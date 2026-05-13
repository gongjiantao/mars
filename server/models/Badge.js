const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 勋章模型
 * 用于公益地图和反网络暴力守护计划的徽章系统
 */
const BadgeSchema = new Schema({
  // 用户ID
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 勋章类型
  type: {
    type: String,
    enum: [
      // 公益勋章
      '环保先锋', '公益达人', '爱心使者', '志愿者', '社区贡献者',
      // 反网络暴力勋章
      '初级守护者', '中级守护者', '高级守护者', '金牌调解员', '和平使者'
    ],
    required: true
  },
  // 勋章等级
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  // 勋章图标
  icon: {
    type: String,
    required: true
  },
  // 勋章颜色
  color: {
    type: String,
    default: '#FFD700' // 金色
  },
  // 勋章描述
  description: {
    type: String,
    required: true
  },
  // 获得条件
  criteria: {
    type: String,
    required: true
  },
  // 获得时间
  earned_at: {
    type: Date,
    default: Date.now
  },
  // 相关活动/事件ID
  related_entity: {
    type: Schema.Types.ObjectId,
    refPath: 'entity_type',
    default: null
  },
  // 相关实体类型
  entity_type: {
    type: String,
    enum: ['Event', 'Post', 'Comment', null],
    default: null
  },
  // 是否已展示（用户是否已查看过）
  is_viewed: {
    type: Boolean,
    default: false
  },
  // 是否公开展示
  is_public: {
    type: Boolean,
    default: true
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

// 更新时自动更新updated_at字段
BadgeSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
BadgeSchema.index({ user_id: 1, type: 1 });
BadgeSchema.index({ earned_at: -1 });

module.exports = mongoose.model('Badge', BadgeSchema);