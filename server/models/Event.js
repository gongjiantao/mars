const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 公益活动模型
 * 用于火星公益地图功能
 */
const EventSchema = new Schema({
  // 活动名称
  title: {
    type: String,
    required: true,
    trim: true
  },
  // 活动描述
  description: {
    type: String,
    required: true
  },
  // 活动地点
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [经度, 纬度]
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    province: String,
    country: String
  },
  // 活动日期
  date: {
    type: Date,
    required: true
  },
  // 活动开始时间
  start_time: {
    type: String,
    required: true
  },
  // 活动结束时间
  end_time: {
    type: String,
    required: true
  },
  // 活动类型
  type: {
    type: String,
    enum: ['环保', '教育', '医疗', '扶贫', '文化', '其他'],
    default: '其他'
  },
  // 活动状态
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  // 报名链接
  signup_link: {
    type: String,
    default: null
  },
  // 活动封面图
  cover_image: {
    type: String,
    default: '/img/events/default-event.jpg'
  },
  // 活动图片
  photos: [{
    url: String,
    caption: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  // 组织者
  organizer: {
    name: String,
    logo: String,
    website: String
  },
  // 参与人数
  participants_count: {
    type: Number,
    default: 0
  },
  // 已报名用户
  participants: [{
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    registered_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  // 活动标签
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
EventSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 创建地理空间索引
EventSchema.index({ 'location.coordinates': '2dsphere' });

// 其他索引
EventSchema.index({ date: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ type: 1 });
EventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', EventSchema);