const mongoose = require('mongoose');

const mapEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '描述不能为空'],
    trim: true,
    maxlength: [500, '描述不能超过500个字符']
  },
  latitude: {
    type: Number,
    required: [true, '纬度不能为空'],
    min: [-90, '纬度必须在-90到90之间'],
    max: [90, '纬度必须在-90到90之间']
  },
  longitude: {
    type: Number,
    required: [true, '经度不能为空'],
    min: [-180, '经度必须在-180到180之间'],
    max: [180, '经度必须在-180到180之间']
  },
  image: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: '匿名用户'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  anonymous_id: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  likes_count: {
    type: Number,
    default: 0
  },
  views_count: {
    type: Number,
    default: 0
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建地理位置索引
mapEventSchema.index({ latitude: 1, longitude: 1 });

// 创建状态索引
mapEventSchema.index({ status: 1 });

// 创建时间索引
mapEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MapEvent', mapEventSchema);