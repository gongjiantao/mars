const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/auth');
const User = require('../models/User');

// 配置头像上传存储
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
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
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const avatarFileFilter = (req, file, cb) => {
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

// 配置头像上传中间件
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @route   POST /api/upload/avatar
 * @desc    上传用户头像
 * @access  Private
 */
router.post('/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的图片' });
    }

    // 构建头像URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新用户头像
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl, updated_at: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    res.json({
      success: true,
      data: {
        avatar: avatarUrl,
        user
      },
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    
    // 如果是multer错误
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: '图片大小不能超过10MB' });
      }
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/upload/avatar-register
 * @desc    注册时上传头像（无需认证）
 * @access  Public
 */
router.post('/avatar-register', uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的图片' });
    }

    // 构建头像URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        avatar: avatarUrl
      },
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('注册头像上传失败:', error);
    
    // 如果是multer错误
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: '图片大小不能超过10MB' });
      }
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

module.exports = router;