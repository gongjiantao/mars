const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @route   GET /api/badges
 * @desc    获取用户的所有徽章
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { user_id, type, is_public } = req.query;
    
    // 构建查询条件
    const query = {};
    
    // 如果是查询自己的徽章，显示所有徽章（包括非公开的）
    if (user_id && user_id !== req.user.id) {
      // 查询其他用户的徽章，只显示公开的
      query.user_id = user_id;
      query.is_public = true;
    } else {
      // 查询自己的徽章，显示所有徽章
      query.user_id = req.user.id;
    }
    
    // 按类型筛选
    if (type) query.type = type;
    
    // 按公开状态筛选（仅对自己的徽章有效）
    if (is_public !== undefined && !user_id) {
      query.is_public = is_public === 'true';
    }
    
    // 查询徽章
    const badges = await Badge.find(query).sort('-earned_at');
    
    res.json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (error) {
    console.error('获取徽章失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/badges/:id
 * @desc    获取单个徽章详情
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({ success: false, error: '未找到该徽章' });
    }
    
    // 检查权限：只有徽章所有者或管理员可以查看非公开徽章
    if (!badge.is_public && badge.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: '无权查看该徽章' });
    }
    
    res.json({
      success: true,
      data: badge
    });
  } catch (error) {
    console.error('获取徽章详情失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该徽章' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/badges/:id/visibility
 * @desc    更新徽章可见性
 * @access  Private
 */
router.put('/:id/visibility', protect, async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({ success: false, error: '未找到该徽章' });
    }
    
    // 检查权限：只有徽章所有者可以更新可见性
    if (badge.user_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: '无权更新该徽章' });
    }
    
    // 更新可见性
    badge.is_public = req.body.is_public;
    badge.updated_at = Date.now();
    
    await badge.save();
    
    res.json({
      success: true,
      data: badge
    });
  } catch (error) {
    console.error('更新徽章可见性失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该徽章' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/badges/types
 * @desc    获取所有徽章类型
 * @access  Public
 */
router.get('/types', async (req, res) => {
  try {
    // 聚合查询获取所有不重复的徽章类型
    const types = await Badge.aggregate([
      { $group: { _id: '$type' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: types.map(t => t._id)
    });
  } catch (error) {
    console.error('获取徽章类型失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/badges/stats
 * @desc    获取徽章统计信息
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // 获取用户的徽章统计信息
    const userBadges = await Badge.find({ user_id: req.user.id });
    
    // 按类型分组
    const badgesByType = {};
    userBadges.forEach(badge => {
      if (!badgesByType[badge.type]) {
        badgesByType[badge.type] = [];
      }
      badgesByType[badge.type].push(badge);
    });
    
    // 计算统计信息
    const stats = {
      total_badges: userBadges.length,
      badges_by_type: Object.keys(badgesByType).map(type => ({
        type,
        count: badgesByType[type].length,
        highest_level: Math.max(...badgesByType[type].map(b => b.level))
      })),
      public_badges: userBadges.filter(b => b.is_public).length,
      private_badges: userBadges.filter(b => !b.is_public).length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取徽章统计信息失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/badges/initialize
 * @desc    初始化示例徽章（仅在没有徽章时使用）
 * @access  Private/Admin
 */
router.post(
  '/initialize',
  [protect, authorize('admin')],
  async (req, res) => {
    try {
      // 检查是否已存在徽章
      const existingBadges = await Badge.countDocuments({ user_id: req.user.id });
      
      if (existingBadges > 0) {
        return res.status(400).json({
          success: false,
          error: '已存在徽章，无法初始化'
        });
      }
      
      // 创建示例徽章
      const sampleBadges = [
        {
          user_id: req.user.id,
          type: '环保先锋',
          level: 2,
          icon: 'eco-leaf',
          color: '#4CAF50',
          description: '参与了5次以上的环保公益活动',
          earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
          is_public: true
        },
        {
          user_id: req.user.id,
          type: '初级守护者',
          level: 1,
          icon: 'shield-bronze',
          color: '#CD7F32',
          description: '在反网络暴力守护计划中贡献了5条以上的正能量留言',
          earned_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
          is_public: true
        },
        {
          user_id: req.user.id,
          type: '公益达人',
          level: 1,
          icon: 'heart-hand',
          color: '#E91E63',
          description: '参与了3次以上的公益活动',
          earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
          is_public: true
        }
      ];
      
      // 保存示例徽章
      await Badge.insertMany(sampleBadges);
      
      res.status(201).json({
        success: true,
        count: sampleBadges.length,
        message: '示例徽章初始化成功'
      });
    } catch (error) {
      console.error('初始化示例徽章失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   POST /api/badges/grant
 * @desc    授予徽章（仅管理员可用）
 * @access  Private/Admin
 */
router.post('/grant', [protect, authorize('admin')], async (req, res) => {
  try {
    const {
      user_id,
      type,
      level,
      icon,
      color,
      description,
      related_entity_id,
      related_entity_type
    } = req.body;
    
    // 检查用户是否已有该类型徽章
    const existingBadge = await Badge.findOne({
      user_id,
      type
    });
    
    if (existingBadge) {
      // 如果已有徽章且等级需要更新
      if (existingBadge.level < level) {
        await Badge.findByIdAndUpdate(
          existingBadge._id,
          {
            level,
            icon,
            color,
            description,
            related_entity_id: related_entity_id || existingBadge.related_entity_id,
            related_entity_type: related_entity_type || existingBadge.related_entity_type,
            updated_at: Date.now()
          }
        );
        
        return res.json({
          success: true,
          message: '徽章等级已更新',
          data: await Badge.findById(existingBadge._id)
        });
      } else {
        return res.status(400).json({
          success: false,
          error: '用户已拥有同等级或更高等级的该类型徽章'
        });
      }
    }
    
    // 创建新徽章
    const newBadge = new Badge({
      user_id,
      type,
      level,
      icon,
      color,
      description,
      related_entity_id: related_entity_id || null,
      related_entity_type: related_entity_type || null,
      earned_at: Date.now(),
      is_public: true
    });
    
    await newBadge.save();
    
    res.status(201).json({
      success: true,
      message: '徽章授予成功',
      data: newBadge
    });
  } catch (error) {
    console.error('授予徽章失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

module.exports = router;