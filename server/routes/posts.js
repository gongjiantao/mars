const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');
const { checkSensitiveWords } = require('../utils/sensitiveWords');

// 时间格式化辅助函数
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  } else {
    return new Date(date).toLocaleDateString('zh-CN');
  }
};

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/posts');
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
    cb(null, 'post-' + uniqueSuffix + ext);
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
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * @route   GET /api/posts
 * @desc    获取所有帖子（支持分页、筛选、排序）
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      emotion, 
      emotion_tag, 
      tag,
      tags, 
      limit = 12, 
      page = 1, 
      sort = '-created_at',
      search
    } = req.query;
    
    // 构建查询条件
    const query = { 
      is_deleted: false,
      status: 'approved'
    };
    
    // 情绪筛选（支持新的emotion参数）
    if (emotion) query.emotion_tag = emotion;
    if (emotion_tag) query.emotion_tag = emotion_tag;
    
    // 标签筛选（支持单个tag和多个tags）
    if (tag) {
      query.tags = { $in: [tag] };
    } else if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // 搜索功能
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // 计算分页
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit))); // 限制每页最多48条
    const skip = (pageNum - 1) * limitNum;
    
    // 处理排序
    let sortOption = {};
    switch (sort) {
      case '-created_at':
        sortOption = { created_at: -1 };
        break;
      case 'created_at':
        sortOption = { created_at: 1 };
        break;
      case '-likes':
        sortOption = { likes: -1, created_at: -1 };
        break;
      case '-comment_count':
        sortOption = { comment_count: -1, created_at: -1 };
        break;
      case 'title':
        sortOption = { content: 1 };
        break;
      case '-title':
        sortOption = { content: -1 };
        break;
      default:
        sortOption = { created_at: -1 };
    }
    
    // 查询帖子
    const posts = await Post.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(); // 使用lean()提高性能
    
    // 获取总数
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);
    
    // 为每个帖子添加一些计算字段
    const enrichedPosts = posts.map(post => ({
      ...post,
      // 确保有默认值
      likes: post.likes || 0,
      comment_count: post.comment_count || 0,
      // 截断内容用于列表显示
      excerpt: post.content ? post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') : '',
      // 格式化时间
      timeAgo: getTimeAgo(post.created_at)
    }));
    
    res.json({
      success: true,
      data: enrichedPosts,
      count: posts.length,
      total,
      totalPages,
      currentPage: pageNum,
      hasMore: pageNum < totalPages,
      pagination: {
        current: pageNum,
        total_pages: totalPages,
        per_page: limitNum,
        total_items: total
      }
    });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    获取单个帖子
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      is_deleted: false,
      status: 'approved'
    });
    
    if (!post) {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('获取帖子失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/posts
 * @desc    创建新帖子
 * @access  Private
 */
router.post(
  '/',
  [
    upload.array('images', 3), // 最多上传3张图片
    [
      check('content', '内容不能为空').not().isEmpty(),
      check('content', '内容不能超过500个字符').isLength({ max: 500 }),
      check('emotion_tag', '情绪标签不能为空').not().isEmpty(),
      check('anonymous_id', '匿名ID不能为空').not().isEmpty()
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
        emotion_tag,
        tags,
        anonymous_id
      } = req.body;
      
      // 检查内容是否包含敏感词
      const { hasSensitiveWords, filteredText, sensitiveWordsList } = checkSensitiveWords(content);
      
      // 处理上传的图片
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          images.push(`/uploads/posts/${file.filename}`);
        });
      }
      
      // 创建新帖子
      const newPost = new Post({
        user_id: null, // 匿名帖子不关联用户
        anonymous_id: anonymous_id,
        content: hasSensitiveWords ? filteredText : content,
        images,
        emotion_tag,
        tags: tags ? tags.split(',') : [],
        has_sensitive_content: hasSensitiveWords,
        sensitive_words: sensitiveWordsList,
        status: hasSensitiveWords ? 'pending' : 'approved',
        ip_hash: req.ip.replace(/\./g, '').slice(0, 10), // 简单的IP哈希处理
        device_hash: req.headers['user-agent'] ? 
          req.headers['user-agent'].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) : 
          'unknown'
      });
      
      // 保存帖子
      await newPost.save();
      
      // 如果包含敏感词，返回特殊提示
      if (hasSensitiveWords) {
        return res.status(201).json({
          success: true,
          data: newPost,
          message: '您的帖子包含敏感词汇，已被替换并等待审核'
        });
      }
      
      res.status(201).json({
        success: true,
        data: newPost
      });
    } catch (error) {
      console.error('创建帖子失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/posts/:id
 * @desc    更新帖子（仅管理员或作者）
 * @access  Private
 */
router.put(
  '/:id',
  [
    protect,
    [
      check('content', '内容不能超过500个字符').optional().isLength({ max: 500 })
    ]
  ],
  async (req, res) => {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      let post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ success: false, error: '未找到该帖子' });
      }
      
      // 检查权限：只有帖子作者或管理员可以更新
      if (post.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: '无权更新该帖子' });
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
      const authorFields = ['content', 'emotion_tag', 'tags'];
      authorFields.forEach(field => {
        if (req.body[field] !== undefined) {
          // 如果更新内容，检查敏感词
          if (field === 'content') {
            const { hasSensitiveWords, filteredText, sensitiveWordsList } = checkSensitiveWords(req.body.content);
            updateFields.content = hasSensitiveWords ? filteredText : req.body.content;
            updateFields.has_sensitive_content = hasSensitiveWords;
            updateFields.sensitive_words = sensitiveWordsList;
            updateFields.status = hasSensitiveWords ? 'pending' : 'approved';
          } else if (field === 'tags') {
            updateFields.tags = req.body.tags.split(',');
          } else {
            updateFields[field] = req.body[field];
          }
        }
      });
      
      // 更新时间
      updateFields.updated_at = Date.now();
      
      // 更新帖子
      post = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
      
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('更新帖子失败:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: '未找到该帖子' });
      }
      
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    删除帖子（软删除）
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    // 检查权限：只有帖子作者或管理员可以删除
    // 管理员可以删除任何帖子
    if (req.user.role !== 'admin') {
      // 非管理员需要检查是否为帖子作者
      if (!post.user_id || post.user_id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: '无权删除该帖子' });
      }
    }
    
    // 软删除帖子
    await Post.findByIdAndUpdate(
      req.params.id,
      { 
        is_deleted: true,
        updated_at: Date.now()
      }
    );
    
    res.json({
      success: true,
      message: '帖子已删除'
    });
  } catch (error) {
    console.error('删除帖子失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/posts/:id/like
 * @desc    点赞帖子
 * @access  Private
 */
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      is_deleted: false,
      status: 'approved'
    });
    
    if (!post) {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    const postId = req.params.id;
    // 从请求体中获取匿名ID，如果没有则使用用户ID
    const anonymousId = req.body.anonymous_id || req.user.id;
    
    // 检查用户是否已经点赞
    const isLiked = post.liked_by && post.liked_by.includes(anonymousId);
    
    let updateOperation;
    let message;
    
    if (isLiked) {
      // 取消点赞
      updateOperation = {
        $inc: { likes: -1 },
        $pull: { liked_by: anonymousId }
      };
      message = '取消点赞成功';
    } else {
      // 点赞
      updateOperation = {
        $inc: { likes: 1 },
        $addToSet: { liked_by: anonymousId }
      };
      message = '点赞成功';
    }
    
    // 更新帖子
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateOperation,
      { new: true }
    );
    
    const responseData = {
      success: true,
      message,
      data: {
        likes_count: updatedPost.likes,
        is_liked: !isLiked
      }
    };
    
    console.log('点赞API响应数据:', JSON.stringify(responseData));
    res.json(responseData);
  } catch (error) {
    console.error('点赞帖子失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/posts/:id/report
 * @desc    举报帖子
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
      const post = await Post.findOne({
        _id: req.params.id,
        is_deleted: false
      });
      
      if (!post) {
        return res.status(404).json({ success: false, error: '未找到该帖子' });
      }
      
      // 更新举报状态
      await Post.findByIdAndUpdate(
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
      console.error('举报帖子失败:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: '未找到该帖子' });
      }
      
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   GET /api/posts/emotion-tags
 * @desc    获取所有情绪标签
 * @access  Public
 */
router.get('/emotion-tags', async (req, res) => {
  try {
    // 预设的情绪标签
    const emotionTags = [
      '开心', '难过', '愤怒', '焦虑', '迷茫',
      '感动', '孤独', '平静', '兴奋', '疲惫',
      '期待', '失望', '满足', '压力', '释然'
    ];
    
    res.json({
      success: true,
      data: emotionTags
    });
  } catch (error) {
    console.error('获取情绪标签失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/posts/tags
 * @desc    获取所有帖子标签
 * @access  Public
 */
router.get('/tags', async (req, res) => {
  try {
    // 聚合查询获取所有不重复的标签
    const tags = await Post.aggregate([
      { $match: { is_deleted: false, status: 'approved' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: tags.map(t => t._id)
    });
  } catch (error) {
    console.error('获取帖子标签失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/posts/user/:user_id
 * @desc    获取用户的所有帖子
 * @access  Private
 */
router.get('/user/:user_id', protect, async (req, res) => {
  try {
    // 检查权限：只有本人或管理员可以查看用户的所有帖子
    if (req.params.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: '无权查看该用户的帖子' });
    }
    
    const { limit = 10, page = 1, sort = '-created_at' } = req.query;
    
    // 构建查询条件
    const query = { 
      user_id: req.params.user_id,
      is_deleted: false
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询帖子
    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: posts
    });
  } catch (error) {
    console.error('获取用户帖子失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/posts/admin/pending
 * @desc    获取待审核的帖子
 * @access  Private/Admin
 */
router.get('/admin/pending', [protect, authorize('admin')], async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // 构建查询条件
    const query = { 
      status: 'pending',
      is_deleted: false
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询帖子
    const posts = await Post.find(query)
      .sort('-created_at')
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: posts
    });
  } catch (error) {
    console.error('获取待审核帖子失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/posts/admin/reported
 * @desc    获取被举报的帖子
 * @access  Private/Admin
 */
router.get('/admin/reported', [protect, authorize('admin')], async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // 构建查询条件
    const query = { 
      is_reported: true,
      is_deleted: false
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询帖子
    const posts = await Post.find(query)
      .sort('-created_at')
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: posts
    });
  } catch (error) {
    console.error('获取被举报帖子失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/posts/:id/comments
 * @desc    获取特定帖子的评论
 * @access  Public
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const { limit = 20, page = 1, sort = '-created_at' } = req.query;
    
    // 构建查询条件 - 需要将字符串转换为ObjectId
    const mongoose = require('mongoose');
    const query = { 
      post_id: new mongoose.Types.ObjectId(req.params.id),
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
    console.error('获取帖子评论失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/posts/:id/comments
 * @desc    为特定帖子创建评论
 * @access  Private
 */
router.post('/:id/comments', (req, res, next) => {
  console.log('=== 评论路由开始 ===');
  console.log('请求参数:', req.params);
  console.log('请求体:', req.body);
  console.log('请求头:', req.headers);
  next();
}, [
  protect,
  [
    check('content', '内容不能为空').not().isEmpty(),
    check('content', '内容不能超过200个字符').isLength({ max: 200 })
  ]
], async (req, res) => {
  console.log('评论路由被调用，请求体:', req.body);
  
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('验证错误:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    const postId = req.params.id;
    const { content, anonymous_id } = req.body;
    
    console.log('收到评论请求:', { postId, content, anonymous_id, body: req.body });
    
    // 检查帖子是否存在
    const post = await Post.findOne({
      _id: postId,
      is_deleted: false,
      status: 'approved'
    });
    
    if (!post) {
      return res.status(404).json({ success: false, error: '未找到该帖子' });
    }
    
    // 检查敏感词
    const sensitiveWordsResult = checkSensitiveWords(content);
    console.log('敏感词检查结果:', sensitiveWordsResult);
    const { hasSensitiveWords, sanitizedMessage } = sensitiveWordsResult;
    
    // 创建评论
    const commentData = {
      post_id: postId,
      user_id: req.user.id,
      anonymous_id: anonymous_id || req.user.id,
      content: sanitizedMessage,
      has_sensitive_content: hasSensitiveWords,
      is_reviewed: !hasSensitiveWords,
      ip_hash: req.ip.replace(/\./g, '').slice(0, 10),
      device_hash: req.headers['user-agent'] ? 
        req.headers['user-agent'].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) : 
        'unknown'
    };
    
    console.log('准备创建评论，数据:', commentData);
    const newComment = new Comment(commentData);
    
    // 保存评论
    console.log('开始保存评论...');
    const savedComment = await newComment.save();
    console.log('评论保存成功:', savedComment._id);
    
    // 更新帖子评论数
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { comment_count: 1 } }
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
});

module.exports = router;