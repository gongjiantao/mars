const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  // 发送者
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '发送者不能为空']
  },
  // 接收者
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '接收者不能为空']
  },
  // 消息内容
  content: {
    type: String,
    required: [true, '消息内容不能为空'],
    maxlength: [1000, '消息内容不能超过1000个字符']
  },
  // 消息类型
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  // 附件URL（如果是图片或文件消息）
  attachment: {
    type: String,
    default: ''
  },
  // 是否已读
  isRead: {
    type: Boolean,
    default: false
  },
  // 发送时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引以提高查询性能
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, isRead: 1 });
MessageSchema.index({ createdAt: -1 });

// 更新时间中间件
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Message', MessageSchema);