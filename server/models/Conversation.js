const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema({
  // 参与对话的用户（两个用户）
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // 最后一条消息
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  // 最后消息时间
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  // 未读消息数量（针对每个参与者）
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  // 创建时间
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

// 确保参与者数组只有两个用户
ConversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('对话必须包含两个参与者'));
  }
  
  // 确保参与者不重复
  const uniqueParticipants = [...new Set(this.participants.map(p => p.toString()))];
  if (uniqueParticipants.length !== 2) {
    return next(new Error('对话参与者不能重复'));
  }
  
  this.updatedAt = Date.now();
  next();
});

// 创建复合索引确保两个用户之间只有一个对话
ConversationSchema.index({ participants: 1 }, { unique: true });
ConversationSchema.index({ lastMessageTime: -1 });

// 静态方法：查找或创建对话
ConversationSchema.statics.findOrCreateConversation = async function(userId1, userId2) {
  // 确保参与者ID的顺序一致
  const participants = [userId1, userId2].sort();
  
  let conversation = await this.findOne({ participants });
  
  if (!conversation) {
    conversation = new this({
      participants,
      unreadCount: new Map([
        [userId1.toString(), 0],
        [userId2.toString(), 0]
      ])
    });
    await conversation.save();
  }
  
  return conversation;
};

module.exports = mongoose.model('Conversation', ConversationSchema);