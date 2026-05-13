const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const AntiViolenceCase = require('../models/AntiViolenceCase');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @route   GET /api/anti-violence/cases
 * @desc    获取所有反网络暴力案例
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      recommended, 
      tags, 
      limit = 10, 
      page = 1, 
      sort = '-created_at' 
    } = req.query;
    
    // 构建查询条件
    const query = {};
    if (type) query.type = type;
    if (recommended === 'true') query.is_recommended = true;
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询案例
    const cases = await AntiViolenceCase.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await AntiViolenceCase.countDocuments(query);
    
    res.json({
      success: true,
      count: cases.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: cases
    });
  } catch (error) {
    console.error('获取反网络暴力案例失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/anti-violence/cases/:id
 * @desc    获取单个反网络暴力案例
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const antiViolenceCase = await AntiViolenceCase.findById(req.params.id);
    
    if (!antiViolenceCase) {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    // 更新阅读次数
    await AntiViolenceCase.findByIdAndUpdate(
      req.params.id,
      { $inc: { read_count: 1 } }
    );
    
    res.json({
      success: true,
      data: antiViolenceCase
    });
  } catch (error) {
    console.error('获取反网络暴力案例失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/anti-violence/cases
 * @desc    创建新反网络暴力案例
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    [
      check('title', '标题不能为空').not().isEmpty(),
      check('description', '描述不能为空').not().isEmpty(),
      check('type', '类型不能为空').not().isEmpty(),
      check('content', '内容不能为空').not().isEmpty(),
      check('legal_analysis', '法律分析不能为空').not().isEmpty()
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
        title,
        description,
        type,
        content,
        legal_analysis,
        solutions,
        related_laws,
        images,
        videos,
        expert_opinions,
        resources,
        is_recommended,
        tags
      } = req.body;
      
      // 创建新案例
      const newCase = new AntiViolenceCase({
        title,
        description,
        type,
        content,
        legal_analysis,
        solutions: solutions || [],
        related_laws: related_laws || [],
        images: images || [],
        videos: videos || [],
        expert_opinions: expert_opinions || [],
        resources: resources || [],
        is_recommended: is_recommended || false,
        tags: tags || []
      });
      
      // 保存案例
      await newCase.save();
      
      res.status(201).json({
        success: true,
        data: newCase
      });
    } catch (error) {
      console.error('创建反网络暴力案例失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/anti-violence/cases/:id
 * @desc    更新反网络暴力案例
 * @access  Private/Admin
 */
router.put('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    let antiViolenceCase = await AntiViolenceCase.findById(req.params.id);
    
    if (!antiViolenceCase) {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    // 更新字段
    const updateFields = {};
    const fields = [
      'title', 'description', 'type', 'content', 'legal_analysis',
      'solutions', 'related_laws', 'images', 'videos', 'expert_opinions',
      'resources', 'is_recommended', 'tags'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    
    // 更新时间
    updateFields.updated_at = Date.now();
    
    // 更新案例
    antiViolenceCase = await AntiViolenceCase.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json({
      success: true,
      data: antiViolenceCase
    });
  } catch (error) {
    console.error('更新反网络暴力案例失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   DELETE /api/anti-violence/cases/:id
 * @desc    删除反网络暴力案例
 * @access  Private/Admin
 */
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const antiViolenceCase = await AntiViolenceCase.findById(req.params.id);
    
    if (!antiViolenceCase) {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    await antiViolenceCase.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('删除反网络暴力案例失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/anti-violence/cases/:id/like
 * @desc    点赞反网络暴力案例
 * @access  Private
 */
router.put('/:id/like', protect, async (req, res) => {
  try {
    const antiViolenceCase = await AntiViolenceCase.findById(req.params.id);
    
    if (!antiViolenceCase) {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    // 更新点赞次数
    await AntiViolenceCase.findByIdAndUpdate(
      req.params.id,
      { $inc: { like_count: 1 } }
    );
    
    res.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞反网络暴力案例失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/anti-violence/cases/:id/share
 * @desc    分享反网络暴力案例
 * @access  Private
 */
router.put('/:id/share', protect, async (req, res) => {
  try {
    const antiViolenceCase = await AntiViolenceCase.findById(req.params.id);
    
    if (!antiViolenceCase) {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    // 更新分享次数
    await AntiViolenceCase.findByIdAndUpdate(
      req.params.id,
      { $inc: { share_count: 1 } }
    );
    
    res.json({
      success: true,
      message: '分享成功'
    });
  } catch (error) {
    console.error('分享反网络暴力案例失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该案例' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/anti-violence/cases/types
 * @desc    获取所有案例类型
 * @access  Public
 */
router.get('/types', async (req, res) => {
  try {
    // 聚合查询获取所有不重复的类型
    const types = await AntiViolenceCase.aggregate([
      { $group: { _id: '$type' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: types.map(t => t._id)
    });
  } catch (error) {
    console.error('获取案例类型失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/anti-violence/cases/tags
 * @desc    获取所有案例标签
 * @access  Public
 */
router.get('/tags', async (req, res) => {
  try {
    // 聚合查询获取所有不重复的标签
    const tags = await AntiViolenceCase.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: tags.map(t => t._id)
    });
  } catch (error) {
    console.error('获取案例标签失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/anti-violence/cases/initialize
 * @desc    初始化示例反网络暴力案例（仅在没有案例时使用）
 * @access  Private/Admin
 */
router.post(
  '/initialize',
  [protect, authorize('admin')],
  async (req, res) => {
    try {
      // 检查是否已存在案例
      const existingCases = await AntiViolenceCase.countDocuments();
      
      if (existingCases > 0) {
        return res.status(400).json({
          success: false,
          error: '已存在案例，无法初始化'
        });
      }
      
      // 创建示例案例
      const sampleCases = [
        {
          title: '网络言论侮辱案例分析',
          description: '针对网络平台上的侮辱性言论，受害者如何维权',
          type: '网络言论',
          content: '某网络平台上，用户A因与用户B在评论区发生争执，用户B在公开场合发表了针对用户A的侮辱性言论，包含人身攻击和造谣诽谤内容，导致用户A的名誉受损。',
          legal_analysis: '根据《中华人民共和国民法典》第一千零二十四条规定，侵害他人名誉权的，应当承担民事责任。网络平台上的侮辱、诽谤行为同样构成名誉侵权，受害者有权要求侵权人停止侵害、恢复名誉、消除影响、赔礼道歉、赔偿损失。',
          solutions: [
            '保存证据：截图、录屏保存侮辱性言论',
            '向平台投诉：要求删除相关内容',
            '法律途径：可向法院提起民事诉讼，要求赔偿',
            '报警处理：情节严重的可向公安机关报案'
          ],
          related_laws: [
            '《中华人民共和国民法典》第一千零二十四条',
            '《中华人民共和国网络安全法》第十二条',
            '最高人民法院关于审理名誉权案件若干问题的解释'
          ],
          expert_opinions: [
            {
              expert: '李律师',
              opinion: '网络空间不是法外之地，网络侮辱、诽谤行为同样需要承担法律责任。受害者应当及时保存证据，通过法律途径维护自身权益。'
            }
          ],
          resources: [
            {
              title: '如何应对网络暴力',
              link: 'https://example.com/resources/1'
            }
          ],
          is_recommended: true,
          tags: ['网络侮辱', '名誉权', '维权指南']
        },
        {
          title: '未成年人网络欺凌防治',
          description: '针对校园网络欺凌现象的防治措施和应对方法',
          type: '校园欺凌',
          content: '某中学学生小明在班级群中被同学发布恶意P图和侮辱性评论，导致其产生严重心理压力，不敢上学。',
          legal_analysis: '《中华人民共和国未成年人保护法》明确规定，学校应当建立学生欺凌防控制度，对实施欺凌行为的学生进行教育、矫治。网络欺凌作为校园欺凌的一种形式，同样受到法律规制。',
          solutions: [
            '及时向老师、家长反映情况',
            '保存聊天记录等证据',
            '必要时寻求心理咨询师帮助',
            '严重情况可向教育部门投诉'
          ],
          related_laws: [
            '《中华人民共和国未成年人保护法》',
            '《中华人民共和国预防未成年人犯罪法》',
            '教育部等十部门关于防治中小学生欺凌和暴力的指导意见'
          ],
          expert_opinions: [
            {
              expert: '王心理咨询师',
              opinion: '网络欺凌对未成年人心理发展造成的伤害不容忽视，学校和家长应当共同关注孩子的网络交往情况，及时发现并干预欺凌行为。'
            }
          ],
          resources: [
            {
              title: '校园欺凌防治手册',
              link: 'https://example.com/resources/2'
            }
          ],
          is_recommended: true,
          tags: ['未成年人保护', '校园欺凌', '心理健康']
        }
      ];
      
      // 保存示例案例
      await AntiViolenceCase.insertMany(sampleCases);
      
      res.status(201).json({
        success: true,
        count: sampleCases.length,
        message: '示例反网络暴力案例初始化成功'
      });
    } catch (error) {
      console.error('初始化示例反网络暴力案例失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

module.exports = router;