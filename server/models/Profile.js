const mongoose = require('mongoose');

/**
 * 个人资料模型
 * 存储歌手的基本信息
 */
const ProfileSchema = new mongoose.Schema({
  birthday: {
    type: Date,
    required: true
  },
  debut: {
    type: Date,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  fans_name: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: '/img/default-avatar.jpg'
  },
  cover_image: {
    type: String,
    default: '/img/default-cover.jpg'
  },
  social_media: {
    weibo: String,
    instagram: String,
    twitter: String,
    youtube: String,
    bilibili: String
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);