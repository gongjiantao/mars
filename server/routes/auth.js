const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');
const sendEmail = require('../utils/sendEmail');

// 头像存储配置
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const avatarFileFilter = (req, file, cb) => {
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

// 配置头像上传中间件
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    注册新用户（简化版：仅用户名、昵称、密码）
 * @access  Public
 */
router.post(
  '/register',
  (req, res, next) => {
    if (req.get('Content-Type') && req.get('Content-Type').includes('multipart/form-data')) {
      uploadAvatar.single('avatar')(req, res, next);
    } else {
      next();
    }
  },
  [
    check('username', '用户名不能为空').not().isEmpty(),
    check('username', '用户名长度应在3-20个字符之间').isLength({ min: 3, max: 20 }),
    check('password', '密码长度至少为6个字符').isLength({ min: 6 }),
    check('nickname', '昵称不能为空').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({ 
        success: false, 
        error: firstError.msg,
        field: firstError.param,
        errors: errors.array() 
      });
    }
    
    const { username, password, nickname } = req.body;
    
    try {
      // 检查用户名是否已存在
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ success: false, error: '用户名已被使用' });
      }
      
      // 处理头像
      let avatarUrl;
      if (req.file) {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
      } else {
        const avatarFiles = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg'];
        const randomAvatar = avatarFiles[Math.floor(Math.random() * avatarFiles.length)];
        avatarUrl = `/uploads/avatars/${randomAvatar}`;
      }
      
      // 创建新用户
      user = new User({
        username,
        password,
        nickname,
        avatar: avatarUrl,
        role: 'user',
        is_verified: true,
        preferences: {
          notifications: {
            email: true,
            site: true
          },
          privacy: {
            show_email: false,
            show_real_name: false
          },
          theme: 'light',
          language: 'zh-CN'
        }
      });
      
      await user.save();
      
      // 生成JWT令牌
      const token = user.getSignedJwtToken();
      
      // 移除密码字段
      user.password = undefined;
      
      res.status(201).json({
        success: true,
        message: '注册成功！',
        token,
        user
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录（支持用户名登录）
 * @access  Public
 */
router.post(
  '/login',
  [
    check('username', '请提供用户名').exists(),
    check('password', '请提供密码').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { username, password } = req.body;
    
    try {
      // 查找用户（仅支持用户名登录）
      const user = await User.findOne({ username }).select('+password');
      
      if (!user) {
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }
      
      // 检查账户状态
      if (user.status === 'disabled') {
        return res.status(401).json({ success: false, error: '账户已被禁用，请联系管理员' });
      }
      
      // 验证密码
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }
      
      // 更新最后登录时间
      user.last_login = Date.now();
      await user.save({ validateBeforeSave: false });
      
      // 生成JWT令牌
      const token = user.getSignedJwtToken();
      
      // 移除密码字段
      user.password = undefined;
      
      res.json({
        success: true,
        token,
        user
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    更新用户资料
 * @access  Private
 */
router.put(
  '/update-profile',
  [
    protect,
    [
      check('nickname', '昵称不能为空').optional().not().isEmpty(),
      check('bio', '个人简介不能超过200个字符').optional().isLength({ max: 200 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const updateFields = {};
      
      // 基本信息字段
      if (req.body.nickname) updateFields.nickname = req.body.nickname;
      if (req.body.bio !== undefined) updateFields.bio = req.body.bio;
      if (req.body.location) updateFields.location = req.body.location;
      if (req.body.website) updateFields.website = req.body.website;
      if (req.body.avatar) updateFields.avatar = req.body.avatar;
      
      // 偏好设置
      if (req.body.preferences) {
        updateFields.preferences = {};
        
        // 通知设置
        if (req.body.preferences.notifications) {
          updateFields.preferences.notifications = req.body.preferences.notifications;
        }
        
        // 隐私设置
        if (req.body.preferences.privacy) {
          updateFields.preferences.privacy = req.body.preferences.privacy;
        }
        
        // 主题设置
        if (req.body.preferences.theme) {
          updateFields.preferences.theme = req.body.preferences.theme;
        }
        
        // 语言设置
        if (req.body.preferences.language) {
          updateFields.preferences.language = req.body.preferences.language;
        }
      }
      
      // 更新用户资料
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true }
      );
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('更新用户资料失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    修改密码
 * @access  Private
 */
router.put(
  '/change-password',
  [
    protect,
    [
      check('current_password', '请提供当前密码').not().isEmpty(),
      check('new_password', '新密码长度至少为6个字符').isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const user = await User.findById(req.user.id).select('+password');
      
      // 验证当前密码
      const isMatch = await user.matchPassword(req.body.current_password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: '当前密码错误' });
      }
      
      // 更新密码
      user.password = req.body.new_password;
      await user.save();
      
      res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

module.exports = router;
