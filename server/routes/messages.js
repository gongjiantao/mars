const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { protect } = require('../middlewares/auth');

// 获取当前用户的对话列表
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username nickname avatar')
    .populate('lastMessage', 'content type createdAt')
    .sort({ lastMessageTime: -1 });
    
    // 格式化对话数据
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      const unreadCount = conv.unreadCount.get(userId) || 0;
      
      return {
        id: conv._id,
        otherUser: {
          id: otherUser._id,
          username: otherUser.username,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar
        },
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount
      };
    });
    
    res.json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('获取对话列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取对话列表失败'
    });
  }
});

// 获取与特定用户的对话详情
router.get('/conversations/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    // 验证目标用户是否存在
    const otherUser = await User.findById(otherUserId).select('username nickname avatar');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 查找或创建对话
    const conversation = await Conversation.findOrCreateConversation(currentUserId, otherUserId);
    
    // 获取消息列表
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username nickname avatar')
    .populate('receiver', 'username nickname avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
    
    // 标记消息为已读
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );
    
    // 更新对话的未读计数
    conversation.unreadCount.set(currentUserId, 0);
    await conversation.save();
    
    res.json({
      success: true,
      data: {
        conversation: {
          id: conversation._id,
          otherUser: {
            id: otherUser._id,
            username: otherUser.username,
            nickname: otherUser.nickname,
            avatar: otherUser.avatar
          }
        },
        messages: messages.reverse(), // 按时间正序返回
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit
        }
      }
    });
  } catch (error) {
    console.error('获取对话详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取对话详情失败'
    });
  }
});

// 发送消息
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, content, type = 'text', attachment = '' } = req.body;
    const senderId = req.user.id;
    
    // 验证输入
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: '接收者和消息内容不能为空'
      });
    }
    
    // 验证接收者是否存在
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: '接收者不存在'
      });
    }
    
    // 不能给自己发消息
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        error: '不能给自己发送消息'
      });
    }
    
    // 创建消息
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      type,
      attachment
    });
    
    await message.save();
    
    // 填充发送者和接收者信息
    await message.populate('sender', 'username nickname avatar');
    await message.populate('receiver', 'username nickname avatar');
    
    // 查找或创建对话
    const conversation = await Conversation.findOrCreateConversation(senderId, receiverId);
    
    // 更新对话信息
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = message.createdAt;
    
    // 增加接收者的未读计数
    const receiverUnreadCount = conversation.unreadCount.get(receiverId) || 0;
    conversation.unreadCount.set(receiverId, receiverUnreadCount + 1);
    
    await conversation.save();
    
    res.status(201).json({
      success: true,
      data: message,
      message: '消息发送成功'
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      error: '发送消息失败'
    });
  }
});

// 标记消息为已读
router.put('/mark-read/:conversationId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: '对话不存在'
      });
    }
    
    // 验证用户是否是对话参与者
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: '无权访问此对话'
      });
    }
    
    // 获取对话中的另一个用户
    const otherUserId = conversation.participants.find(p => p.toString() !== userId);
    
    // 标记来自对方的未读消息为已读
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { isRead: true }
    );
    
    // 重置未读计数
    conversation.unreadCount.set(userId, 0);
    await conversation.save();
    
    res.json({
      success: true,
      message: '消息已标记为已读'
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({
      success: false,
      error: '标记已读失败'
    });
  }
});

// 获取未读消息总数
router.get('/unread-count', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    });
    
    let totalUnreadCount = 0;
    conversations.forEach(conv => {
      const unreadCount = conv.unreadCount.get(userId) || 0;
      totalUnreadCount += unreadCount;
    });
    
    res.json({
      success: true,
      data: {
        unreadCount: totalUnreadCount
      }
    });
  } catch (error) {
    console.error('获取未读消息数失败:', error);
    res.status(500).json({
      success: false,
      error: '获取未读消息数失败'
    });
  }
});

// 删除消息
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: '消息不存在'
      });
    }
    
    // 只有发送者可以删除消息
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: '只能删除自己发送的消息'
      });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({
      success: true,
      message: '消息删除成功'
    });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({
      success: false,
      error: '删除消息失败'
    });
  }
});

module.exports = router;