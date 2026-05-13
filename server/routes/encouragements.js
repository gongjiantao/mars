const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Encouragement = require('../models/Encouragement');
const Badge = require('../models/Badge');
const { protect, authorize } = require('../middlewares/auth');
const { checkSensitiveWords } = require('../utils/sensitiveWords');

/**
 * @route   GET /api/anti-violence/encouragements
 * @desc    获取所有守护者留言
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      recommended, 
      case_id, 
      limit = 20, 
      page = 1, 
      sort = '-created_at' 
    } = req.query;
    
    // 构建查询条件
    const query = { is_approved: true };
    if (type) query.type = type;
    if (recommended === 'true') query.is_recommended = true;
    if (case_id) query.case_id = case_id;
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询留言
    const encouragements = await Encouragement.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Encouragement.countDocuments(query);
    
    res.json({
      success: true,
      count: encouragements.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: encouragements
    });
  } catch (error) {
    console.error('获取守护者留言失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/anti-violence/encouragements/:id
 * @desc    获取单个守护者留言
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const encouragement = await Encouragement.findById(req.params.id);
    
    if (!encouragement) {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    res.json({
      success: true,
      data: encouragement
    });
  } catch (error) {
    console.error('获取守护者留言失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/anti-violence/encouragements
 * @desc    创建新守护者留言
 * @access  Private
 */
router.post(
  '/',
  [
    protect,
    [
      check('content', '留言内容不能为空').not().isEmpty(),
      check('content', '留言内容不能超过200个字符').isLength({ max: 200 }),
      check('type', '留言类型不能为空').not().isEmpty()
    ]
  ],
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const {
        content,
        type,
        case_id,
        anonymous_id,
        bg_color,
        font_color
      } = req.body;
      
      // 检查内容是否包含暴力词汇
      const { hasSensitiveWords, filteredText } = checkSensitiveWords(content);
      
      if (hasSensitiveWords) {
        return res.status(400).json({
          success: false,
          error: '留言内容包含不当用语，请修改后重试'
        });
      }
      
      // 创建新留言
      const newEncouragement = new Encouragement({
        user_id: req.user.id,
        anonymous_id: anonymous_id || null,
        content,
        type,
        case_id: case_id || null,
        bg_color: bg_color || '#ffffff',
        font_color: font_color || '#000000',
        ip_hash: req.ip.replace(/\./g, '').slice(0, 10) // 简单的IP哈希处理
      });
      
      // 保存留言
      await newEncouragement.save();
      
      // 更新用户徽章
      await updateUserBadge(req.user.id);
      
      res.status(201).json({
        success: true,
        data: newEncouragement
      });
    } catch (error) {
      console.error('创建守护者留言失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/anti-violence/encouragements/:id/like
 * @desc    点赞守护者留言
 * @access  Private
 */
router.put('/:id/like', protect, async (req, res) => {
  try {
    const encouragement = await Encouragement.findById(req.params.id);
    
    if (!encouragement) {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    // 更新点赞次数
    await Encouragement.findByIdAndUpdate(
      req.params.id,
      { $inc: { like_count: 1 } }
    );
    
    res.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞守护者留言失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/anti-violence/encouragements/:id/report
 * @desc    举报守护者留言
 * @access  Private
 */
router.put('/:id/report', protect, async (req, res) => {
  try {
    const encouragement = await Encouragement.findById(req.params.id);
    
    if (!encouragement) {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    // 更新举报状态
    await Encouragement.findByIdAndUpdate(
      req.params.id,
      { is_reported: true }
    );
    
    res.json({
      success: true,
      message: '举报成功，我们会尽快审核'
    });
  } catch (error) {
    console.error('举报守护者留言失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/anti-violence/encouragements/:id/approve
 * @desc    审核通过守护者留言
 * @access  Private/Admin
 */
router.put('/:id/approve', [protect, authorize('admin')], async (req, res) => {
  try {
    const encouragement = await Encouragement.findById(req.params.id);
    
    if (!encouragement) {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    // 更新审核状态
    await Encouragement.findByIdAndUpdate(
      req.params.id,
      { 
        is_approved: true,
        is_reported: false,
        is_recommended: req.body.is_recommended || false
      }
    );
    
    res.json({
      success: true,
      message: '审核通过成功'
    });
  } catch (error) {
    console.error('审核守护者留言失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   DELETE /api/anti-violence/encouragements/:id
 * @desc    删除守护者留言
 * @access  Private/Admin
 */
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const encouragement = await Encouragement.findById(req.params.id);
    
    if (!encouragement) {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    await encouragement.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('删除守护者留言失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该留言' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/anti-violence/encouragements/types
 * @desc    获取所有留言类型
 * @access  Public
 */
router.get('/types', async (req, res) => {
  try {
    // 聚合查询获取所有不重复的类型
    const types = await Encouragement.aggregate([
      { $group: { _id: '$type' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: types.map(t => t._id)
    });
  } catch (error) {
    console.error('获取留言类型失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/anti-violence/encouragements/colors
 * @desc    获取预设的背景和字体颜色
 * @access  Public
 */
router.get('/colors', (req, res) => {
  // 预设的背景和字体颜色组合
  const colorSchemes = [
    { bg_color: '#f8f9fa', font_color: '#212529' }, // 浅灰底黑字
    { bg_color: '#e9ecef', font_color: '#495057' }, // 灰底深灰字
    { bg_color: '#fff3cd', font_color: '#856404' }, // 浅黄底棕字
    { bg_color: '#d1ecf1', font_color: '#0c5460' }, // 浅蓝底深蓝字
    { bg_color: '#d4edda', font_color: '#155724' }, // 浅绿底深绿字
    { bg_color: '#f8d7da', font_color: '#721c24' }, // 浅红底深红字
    { bg_color: '#e2e3e5', font_color: '#383d41' }, // 浅灰底深灰字
    { bg_color: '#cce5ff', font_color: '#004085' }, // 浅蓝底深蓝字
    { bg_color: '#f5f5f5', font_color: '#333333' }, // 浅灰底黑字
    { bg_color: '#ffe8cc', font_color: '#d35400' }  // 浅橙底深橙字
  ];
  
  res.json({
    success: true,
    data: colorSchemes
  });
});

/**
 * @route   POST /api/anti-violence/encouragements/initialize
 * @desc    初始化示例守护者留言（仅在没有留言时使用）
 * @access  Private/Admin
 */
router.post(
  '/initialize',
  [protect, authorize('admin')],
  async (req, res) => {
    try {
      // 检查是否已存在留言
      const existingEncouragements = await Encouragement.countDocuments();
      
      if (existingEncouragements > 0) {
        return res.status(400).json({
          success: false,
          error: '已存在留言，无法初始化'
        });
      }
      
      // 创建示例留言
      const sampleEncouragements = [
        {
          user_id: req.user.id,
          content: '每个人都有被尊重的权利，让我们共同抵制网络暴力，创造友善的网络环境。',
          type: '鼓励',
          is_approved: true,
          is_recommended: true,
          bg_color: '#d4edda',
          font_color: '#155724',
          like_count: 42,
          ip_hash: '1234567890'
        },
        {
          user_id: req.user.id,
          content: '言论自由不等于可以伤害他人，请记住网络上的每一个ID背后都是有血有肉的人。',
          type: '反思',
          is_approved: true,
          is_recommended: true,
          bg_color: '#cce5ff',
          font_color: '#004085',
          like_count: 38,
          ip_hash: '0987654321'
        },
        {
          user_id: req.user.id,
          content: '作为守护者，我承诺用善意和尊重对待每一个网络中的人，从我做起，传递正能量。',
          type: '承诺',
          is_approved: true,
          is_recommended: true,
          bg_color: '#fff3cd',
          font_color: '#856404',
          like_count: 27,
          ip_hash: '1357924680'
        }
      ];
      
      // 保存示例留言
      await Encouragement.insertMany(sampleEncouragements);
      
      res.status(201).json({
        success: true,
        count: sampleEncouragements.length,
        message: '示例守护者留言初始化成功'
      });
    } catch (error) {
      console.error('初始化示例守护者留言失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * 更新用户徽章
 * @param {string} userId - 用户ID
 */
async function updateUserBadge(userId) {
  try {
    // 获取用户留言数量
    const encouragementCount = await Encouragement.countDocuments({
      user_id: userId,
      is_approved: true
    });
    
    // 根据留言数量确定徽章等级
    let badgeType = null;
    let badgeLevel = 0;
    let badgeIcon = '';
    let badgeColor = '';
    let badgeDescription = '';
    
    if (encouragementCount >= 50) {
      badgeType = '金牌调解员';
      badgeLevel = 3;
      badgeIcon = 'shield-gold';
      badgeColor = '#FFD700';
      badgeDescription = '在反网络暴力守护计划中贡献了50条以上的正能量留言';
    } else if (encouragementCount >= 20) {
      badgeType = '高级守护者';
      badgeLevel = 2;
      badgeIcon = 'shield-silver';
      badgeColor = '#C0C0C0';
      badgeDescription = '在反网络暴力守护计划中贡献了20条以上的正能量留言';
    } else if (encouragementCount >= 5) {
      badgeType = '初级守护者';
      badgeLevel = 1;
      badgeIcon = 'shield-bronze';
      badgeColor = '#CD7F32';
      badgeDescription = '在反网络暴力守护计划中贡献了5条以上的正能量留言';
    } else {
      // 不足5条留言，不授予徽章
      return;
    }
    
    // 检查用户是否已有该类型徽章
    const existingBadge = await Badge.findOne({
      user_id: userId,
      type: badgeType
    });
    
    if (existingBadge) {
      // 如果已有徽章且等级需要更新
      if (existingBadge.level < badgeLevel) {
        await Badge.findByIdAndUpdate(
          existingBadge._id,
          {
            level: badgeLevel,
            icon: badgeIcon,
            color: badgeColor,
            description: badgeDescription,
            updated_at: Date.now()
          }
        );
      }
    } else {
      // 创建新徽章
      const newBadge = new Badge({
        user_id: userId,
        type: badgeType,
        level: badgeLevel,
        icon: badgeIcon,
        color: badgeColor,
        description: badgeDescription,
        earned_at: Date.now()
      });
      
      await newBadge.save();
    }
  } catch (error) {
    console.error('更新用户徽章失败:', error);
  }
}

module.exports = router;