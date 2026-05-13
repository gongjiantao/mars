const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Award = require('../models/Award');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @route   GET /api/awards
 * @desc    获取所有获奖记录
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { year, limit = 20, page = 1, sort = '-date' } = req.query;
    
    // 构建查询条件
    const query = {};
    if (year) query.year = parseInt(year);
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询获奖记录
    const awards = await Award.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('related_work', 'title type cover_img');
    
    // 获取总数
    const total = await Award.countDocuments(query);
    
    res.json({
      success: true,
      count: awards.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: awards
    });
  } catch (error) {
    console.error('获取获奖记录失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/awards/:id
 * @desc    获取单个获奖记录
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const award = await Award.findById(req.params.id)
      .populate('related_work', 'title type cover_img preview_url');
    
    if (!award) {
      return res.status(404).json({ success: false, error: '未找到该获奖记录' });
    }
    
    res.json({
      success: true,
      data: award
    });
  } catch (error) {
    console.error('获取获奖记录失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该获奖记录' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/awards
 * @desc    创建新获奖记录
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    [
      check('year', '年份不能为空').isInt({ min: 1900, max: new Date().getFullYear() }),
      check('date', '日期不能为空').not().isEmpty(),
      check('event', '颁奖典礼/活动名称不能为空').not().isEmpty(),
      check('award', '奖项名称不能为空').not().isEmpty()
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
        year,
        date,
        event,
        award,
        category,
        description,
        image,
        related_work
      } = req.body;
      
      // 创建新获奖记录
      const newAward = new Award({
        year,
        date,
        event,
        award,
        category: category || '音乐',
        description: description || '',
        image: image || '/img/awards/trophy.svg',
        related_work: related_work || null
      });
      
      // 保存获奖记录
      await newAward.save();
      
      res.status(201).json({
        success: true,
        data: newAward
      });
    } catch (error) {
      console.error('创建获奖记录失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/awards/:id
 * @desc    更新获奖记录
 * @access  Private/Admin
 */
router.put('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    let award = await Award.findById(req.params.id);
    
    if (!award) {
      return res.status(404).json({ success: false, error: '未找到该获奖记录' });
    }
    
    // 更新字段
    const updateFields = {};
    const fields = [
      'year', 'date', 'event', 'award', 'category',
      'description', 'image', 'related_work'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    
    // 更新时间
    updateFields.updated_at = Date.now();
    
    // 更新获奖记录
    award = await Award.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json({
      success: true,
      data: award
    });
  } catch (error) {
    console.error('更新获奖记录失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该获奖记录' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   DELETE /api/awards/:id
 * @desc    删除获奖记录
 * @access  Private/Admin
 */
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    
    if (!award) {
      return res.status(404).json({ success: false, error: '未找到该获奖记录' });
    }
    
    await award.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('删除获奖记录失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该获奖记录' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/awards/years
 * @desc    获取所有获奖年份
 * @access  Public
 */
router.get('/years', async (req, res) => {
  try {
    // 聚合查询获取所有不重复的年份并排序
    const years = await Award.aggregate([
      { $group: { _id: '$year' } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      success: true,
      data: years.map(y => y._id)
    });
  } catch (error) {
    console.error('获取获奖年份失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/awards/initialize
 * @desc    初始化示例获奖记录（仅在没有记录时使用）
 * @access  Private/Admin
 */
router.post(
  '/initialize',
  [protect, authorize('admin')],
  async (req, res) => {
    try {
      // 检查是否已存在获奖记录
      const existingAwards = await Award.countDocuments();
      
      if (existingAwards > 0) {
        return res.status(400).json({
          success: false,
          error: '已存在获奖记录，无法初始化'
        });
      }
      
      // 创建示例获奖记录
      const sampleAwards = [
        {
          year: 2020,
          date: '2020-12-15',
          event: '亚洲新歌榜年度盛典',
          award: '最佳男歌手',
          category: '音乐',
          description: '凭借专辑《星辰大海》获得最佳男歌手奖。',
          image: '/img/awards/best-male-singer.svg'
        },
        {
          year: 2019,
          date: '2019-11-20',
          event: '音乐风云榜',
          award: '年度最佳新人',
          category: '音乐',
          description: '凭借单曲《烟火里的尘埃》获得年度最佳新人奖。',
          image: '/img/awards/best-newcomer.svg'
        },
        {
          year: 2018,
          date: '2018-08-10',
          event: '全球华语金曲奖',
          award: '最具潜力歌手',
          category: '音乐',
          description: '凭借出色的演唱实力获得最具潜力歌手奖。',
          image: '/img/awards/most-promising.svg'
        }
      ];
      
      // 保存示例获奖记录
      await Award.insertMany(sampleAwards);
      
      res.status(201).json({
        success: true,
        count: sampleAwards.length,
        message: '示例获奖记录初始化成功'
      });
    } catch (error) {
      console.error('初始化示例获奖记录失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

module.exports = router;