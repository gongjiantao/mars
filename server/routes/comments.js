const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect, authorize } = require('../middlewares/auth');
const { checkSensitiveWords } = require('../utils/sensitiveWords');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/comments');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'comment-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持JPEG、PNG和GIF格式的图片'), false);
  }
};

// 配置上传中间件
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

/**
 * @route   GET /api/comments
 * @desc    获取评论（按帖子ID或父评论ID）
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      post_id, 
      parent_id, 
      limit = 20, 
      page = 1, 
      sort = '-created_at' 
    } = req.query;
    
    // 构建查询条件
    const query = { 
      is_deleted: false,
      status: 'approved'
    };
    
    if (post_id) query.post_id = post_id;
    if (parent_id) query.parent_id = parent_id;
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询评论
    const comments = await Comment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Comment.countDocuments(query);
    
    res.json({
      success: true,
      count: comments.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: comments
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/comments/:id
 * @desc    获取单个评论
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      is_deleted: false,
      status: 'approved'
    });
    
    if (!comment) {
      return res.status(404).json({ success: false, error: '未找到该评论' });
    }
    
    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该评论' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/comments
 * @desc    创建新评论
 * @access  Private
 */
router.post(
  '/',
  [
    protect,
    upload.single('image'),
    [
      check('post_id', '帖子ID不能为空').not().isEmpty(),
      check('content', '内容不能为空').not().isEmpty(),
      check('content', '内容不能超过200个字符').isLength({ max: 200 })
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
        post_id,
        parent_id,
        content,
        emotion_tag,
        anonymous_id
      } = req.body;
      
      // 检查帖子是否存在
      const post = await Post.findOne({
        _id: post_id,
        is_deleted: false,
        status: 'approved'
      });
      
      if (!post) {
        return res.status(404).json({ success: false, error: '未找到该帖子' });
      }
      
      // 检查父评论是否存在（如果有）
      let level = 1; // 默认为一级评论
      if (parent_id) {
        const parentComment = await Comment.findOne({
          _id: parent_id,
          is_deleted: false,
          status: 'approved'
        });
        
        if (!parentComment) {
          return res.status(404).json({ success: false, error: '未找到父评论' });
        }
        
        // 设置评论层级
        level = parentComment.level + 1;
        
        // 限制评论嵌套层级
        if (level > 3) {
          return res.status(400).json({ success: false, error: '评论嵌套层级不能超过3层' });
        }
      }
      
      // 检查内容是否包含敏感词
      const { hasSensitiveWords, filteredText, sensitiveWordsList } = checkSensitiveWords(content);
      
      // 处理上传的图片
      const image = req.file ? `/uploads/comments/${req.file.filename}` : null;
      
      // 创建新评论
      const newComment = new Comment({
        post_id,
        parent_id: parent_id || null,
        level,
        user_id: req.user.id,
        anonymous_id: anonymous_id || Math.floor(Math.random() * 1000000).toString(),
        content: hasSensitiveWords ? filteredText : content,
        image,
        emotion_tag: emotion_tag || null,
        has_sensitive_content: hasSensitiveWords,
        sensitive_words: sensitiveWordsList,
        status: hasSensitiveWords ? 'pending' : 'approved',
        ip_hash: req.ip.replace(/\./g, '').slice(0, 10), // 简单的IP哈希处理
        device_hash: req.headers['user-agent'] ? 
          req.headers['user-agent'].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) : 
          'unknown'
      });
      
      // 保存评论
      await newComment.save();
      
      // 更新帖子评论数
      await Post.findByIdAndUpdate(
        post_id,
        { $inc: { comments_count: 1 } }
      );
      
      // 如果包含敏感词，返回特殊提示
      if (hasSensitiveWords) {
        return res.status(201).json({
          success: true,
          data: newComment,
          message: '您的评论包含敏感词汇，已被替换并等待审核'
        });
      }
      
      res.status(201).json({
        success: true,
        data: newComment
      });
    } catch (error) {
      console.error('创建评论失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/comments/:id
 * @desc    更新评论（仅管理员或作者）
 * @access  Private
 */
router.put(
  '/:id',
  [
    protect,
    [
      check('content', '内容不能超过200个字符').optional().isLength({ max: 200 })
    ]
  ],
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      let comment = await Comment.findById(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ success: false, error: '未找到该评论' });
      }
      
      // 检查权限：只有评论作者或管理员可以更新
      if (comment.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: '无权更新该评论' });
      }
      
      // 更新字段
      const updateFields = {};
      
      // 管理员可以更新的字段
      if (req.user.role === 'admin') {
        const adminFields = ['status', 'is_reported', 'report_reason'];
        adminFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updateFields[field] = req.body[field];
          }
        });
      }
      
      // 作者可以更新的字段
      if (comment.user_id.toString() === req.user.id) {
        if (req.body.content) {
          // 检查内容是否包含敏感词
          const { hasSensitiveWords, filteredText, sensitiveWordsList } = checkSensitiveWords(req.body.content);
          updateFields.content = hasSensitiveWords ? filteredText : req.body.content;
          updateFields.has_sensitive_content = hasSensitiveWords;
          updateFields.sensitive_words = sensitiveWordsList;
          updateFields.status = hasSensitiveWords ? 'pending' : 'approved';
        }
        
        if (req.body.emotion_tag) {
          updateFields.emotion_tag = req.body.emotion_tag;
        }
      }
      
      // 更新时间
      updateFields.updated_at = Date.now();
      
      // 更新评论
      comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
      
      res.json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('更新评论失败:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: '未找到该评论' });
      }
      
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    删除评论（软删除）
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ success: false, error: '未找到该评论' });
    }
    
    // 检查权限：只有评论作者或管理员可以删除
    if (comment.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: '无权删除该评论' });
    }
    
    // 软删除评论
    await Comment.findByIdAndUpdate(
      req.params.id,
      { 
        is_deleted: true,
        updated_at: Date.now()
      }
    );
    
    // 更新帖子评论数
    await Post.findByIdAndUpdate(
      comment.post_id,
      { $inc: { comments_count: -1 } }
    );
    
    res.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该评论' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/comments/:id/like
 * @desc    点赞评论
 * @access  Private
 */
router.put('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      is_deleted: false,
      status: 'approved'
    });
    
    if (!comment) {
      return res.status(404).json({ success: false, error: '未找到该评论' });
    }
    
    // 更新点赞次数
    await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes_count: 1 } }
    );
    
    res.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞评论失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该评论' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/comments/:id/report
 * @desc    举报评论
 * @access  Private
 */
router.put(
  '/:id/report',
  [
    protect,
    [
      check('reason', '举报原因不能为空').not().isEmpty()
    ]
  ],
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const comment = await Comment.findOne({
        _id: req.params.id,
        is_deleted: false
      });
      
      if (!comment) {
        return res.status(404).json({ success: false, error: '未找到该评论' });
      }
      
      // 更新举报状态
      await Comment.findByIdAndUpdate(
        req.params.id,
        { 
          is_reported: true,
          report_reason: req.body.reason,
          updated_at: Date.now()
        }
      );
      
      res.json({
        success: true,
        message: '举报成功，我们会尽快审核'
      });
    } catch (error) {
      console.error('举报评论失败:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: '未找到该评论' });
      }
      
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   GET /api/comments/user/:user_id
 * @desc    获取用户的所有评论
 * @access  Private
 */
router.get('/user/:user_id', protect, async (req, res) => {
  try {
    // 检查权限：只有本人或管理员可以查看用户的所有评论
    if (req.params.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: '无权查看该用户的评论' });
    }
    
    const { limit = 20, page = 1, sort = '-created_at' } = req.query;
    
    // 构建查询条件
    const query = { 
      user_id: req.params.user_id,
      is_deleted: false
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询评论
    const comments = await Comment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Comment.countDocuments(query);
    
    res.json({
      success: true,
      count: comments.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: comments
    });
  } catch (error) {
    console.error('获取用户评论失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/comments/admin/pending
 * @desc    获取待审核的评论
 * @access  Private/Admin
 */
router.get('/admin/pending', [protect, authorize('admin')], async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    // 构建查询条件
    const query = { 
      status: 'pending',
      is_deleted: false
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询评论
    const comments = await Comment.find(query)
      .sort('-created_at')
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Comment.countDocuments(query);
    
    res.json({
      success: true,
      count: comments.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: comments
    });
  } catch (error) {
    console.error('获取待审核评论失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/comments/admin/reported
 * @desc    获取被举报的评论
 * @access  Private/Admin
 */
router.get('/admin/reported', [protect, authorize('admin')], async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    // 构建查询条件
    const query = { 
      is_reported: true,
      is_deleted: false
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询评论
    const comments = await Comment.find(query)
      .sort('-created_at')
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Comment.countDocuments(query);
    
    res.json({
      success: true,
      count: comments.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: comments
    });
  } catch (error) {
    console.error('获取被举报评论失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

module.exports = router;