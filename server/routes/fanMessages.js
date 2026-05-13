const express = require('express');
const router = express.Router();
const FanMessage = require('../models/FanMessage');
const { protect: auth } = require('../middlewares/auth');

/**
 * @route GET /api/fan-messages
 * @desc 获取所有粉丝留言
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const messages = await FanMessage.find({ is_active: true })
      .sort({ sort_order: 1, created_at: 1 })
      .select('message_id name message avatar likes');
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('获取粉丝留言失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route POST /api/fan-messages/:messageId/like
 * @desc 为指定留言点赞
 * @access Public
 */
router.post('/:messageId/like', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await FanMessage.findOne({ message_id: parseInt(messageId) });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }
    
    // 增加点赞数
    message.likes += 1;
    await message.save();
    
    res.json({
      success: true,
      data: {
        message_id: message.message_id,
        likes: message.likes
      }
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route POST /api/fan-messages/:messageId/reset-likes
 * @desc 重置指定留言的点赞数（仅管理员）
 * @access Private (Admin only)
 */
router.post('/:messageId/reset-likes', auth, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可操作'
      });
    }
    
    const { messageId } = req.params;
    
    const message = await FanMessage.findOne({ message_id: parseInt(messageId) });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }
    
    // 重置点赞数为0
    message.likes = 0;
    await message.save();
    
    res.json({
      success: true,
      data: {
        message_id: message.message_id,
        likes: message.likes
      },
      message: '点赞数已重置为0'
    });
  } catch (error) {
    console.error('重置点赞数失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route POST /api/fan-messages/reset-all-likes
 * @desc 重置所有留言的点赞数（仅管理员）
 * @access Private (Admin only)
 */
router.post('/reset-all-likes', auth, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可操作'
      });
    }
    
    // 重置所有留言的点赞数为0
    const result = await FanMessage.updateMany(
      {},
      { $set: { likes: 0 } }
    );
    
    res.json({
      success: true,
      data: {
        modified_count: result.modifiedCount
      },
      message: `已重置 ${result.modifiedCount} 条留言的点赞数`
    });
  } catch (error) {
    console.error('重置所有点赞数失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route GET /api/fan-messages/admin
 * @desc 获取所有粉丝留言（管理员视图，包含隐藏的）
 * @access Private (Admin only)
 */
router.get('/admin', auth, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }
    
    const messages = await FanMessage.find({})
      .sort({ sort_order: 1, created_at: 1 });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('获取管理员留言列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;