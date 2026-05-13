const mongoose = require('mongoose');

/**
 * 作品模型
 * 存储歌手的歌曲、视频和专辑信息
 */
const WorkSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['song', 'video', 'album'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  release_date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  cover_img: {
    type: String,
    required: true
  },
  // 歌曲特有字段
  preview_url: {
    type: String,
    default: null
  },
  duration: {
    type: Number, // 秒数
    default: null
  },
  lyrics: {
    type: String,
    default: null
  },
  // 视频特有字段
  video_url: {
    type: String,
    default: null
  },
  video_platform: {
    type: String,
    enum: ['youtube', 'bilibili', 'own'],
    default: null
  },
  video_id: {
    type: String, // YouTube或B站的视频ID
    default: null
  },
  // 专辑特有字段
  tracks: [{
    title: String,
    duration: Number,
    preview_url: String
  }],
  // 通用字段
  tags: [String],
  featured_artists: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新updated_at字段
WorkSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// 索引
WorkSchema.index({ type: 1 });
WorkSchema.index({ release_date: -1 });
WorkSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Work', WorkSchema);