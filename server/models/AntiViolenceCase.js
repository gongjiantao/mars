const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 反网络暴力案例模型
 * 用于反网络暴力守护计划功能
 */
const AntiViolenceCaseSchema = new Schema({
  // 案例标题
  title: {
    type: String,
    required: true,
    trim: true
  },
  // 案例描述
  description: {
    type: String,
    required: true
  },
  // 案例类型
  type: {
    type: String,
    enum: ['网络霸凌', '人身攻击', '谣言传播', '隐私侵犯', '身份冒用', '其他'],
    default: '其他'
  },
  // 案例内容
  content: {
    type: String,
    required: true
  },
  // 法律分析
  legal_analysis: {
    type: String,
    required: true
  },
  // 解决方案
  solutions: [{
    title: String,
    description: String,
    steps: [String]
  }],
  // 相关法律法规
  related_laws: [{
    name: String,
    article: String,
    content: String,
    link: String
  }],
  // 案例图片
  images: [{
    url: String,
    caption: String
  }],
  // 案例视频
  video: {
    url: String,
    thumbnail: String,
    duration: Number
  },
  // 专家观点
  expert_opinions: [{
    expert_name: String,
    title: String,
    opinion: String,
    avatar: String
  }],
  // 相关资源
  resources: [{
    title: String,
    type: String, // 'article', 'video', 'website', 'hotline'
    url: String,
    description: String
  }],
  // 是否推荐
  is_featured: {
    type: Boolean,
    default: false
  },
  // 阅读次数
  view_count: {
    type: Number,
    default: 0
  },
  // 点赞次数
  like_count: {
    type: Number,
    default: 0
  },
  // 分享次数
  share_count: {
    type: Number,
    default: 0
  },
  // 标签
  tags: [String],
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
AntiViolenceCaseSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
AntiViolenceCaseSchema.index({ type: 1 });
AntiViolenceCaseSchema.index({ is_featured: 1 });
AntiViolenceCaseSchema.index({ view_count: -1 });
AntiViolenceCaseSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('AntiViolenceCase', AntiViolenceCaseSchema);