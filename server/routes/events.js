const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const MapEvent = require('../models/MapEvent');
const { protect, authorize } = require('../middlewares/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads/map-events');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'map-event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('只允许上传图片文件');
    error.statusCode = 400; // 明确设置为400而不是让系统默认
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * @route   GET /api/events
 * @desc    获取所有地图事件
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      status = 'approved',
      limit = 100,
      page = 1,
      sort = '-createdAt'
    } = req.query;
    
    // 构建查询条件
    const query = {
      is_deleted: false,
      status: status
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询地图事件
    const events = await MapEvent.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    // 获取总数
    const total = await MapEvent.countDocuments(query);
    
    res.json({
      success: true,
      count: events.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: events
    });
  } catch (error) {
    console.error('获取地图事件失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/events
 * @desc    创建新的地图事件
 * @access  Public
 */
router.post(
  '/',
  (req, res, next) => {
    console.log('=== POST /api/events 路由开始处理 ===');
    console.log('请求方法:', req.method);
    console.log('请求路径:', req.path);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Authorization:', req.get('Authorization'));
    
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer错误:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: '图片大小不能超过5MB' });
          }
        }
        return res.status(400).json({ success: false, error: err.message || '文件上传失败' });
      }
      console.log('Multer处理完成，继续下一步');
      next();
    });
  },
  [
    check('title', '标题不能为空').not().isEmpty(),
    check('description', '描述不能为空').not().isEmpty(),
    check('latitude', '纬度必须是有效数字').isFloat({ min: -90, max: 90 }),
    check('longitude', '经度必须是有效数字').isFloat({ min: -180, max: 180 })
  ],
  async (req, res) => {
    console.log('POST /api/events 路由被调用');
    console.log('请求头:', req.headers);
    console.log('请求体:', req.body);
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const {
        title,
        description,
        latitude,
        longitude,
        author,
        anonymous_id
      } = req.body;
      
      // 处理图片上传
      let imagePath = '';
      if (req.file) {
        // 确保路径格式正确
        imagePath = `/uploads/map-events/${req.file.filename}`;
        console.log('保存的图片路径:', imagePath); // 添加调试日志
        console.log('实际文件路径:', req.file.path); // 添加调试日志
      }
      
      // 创建新的地图事件
      const newEvent = new MapEvent({
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        image: imagePath,
        author: author || '匿名用户',
        user_id: req.user ? req.user.id : null,
        anonymous_id: anonymous_id || null
      });
      
      // 保存事件
      await newEvent.save();
      
      res.status(201).json({
        success: true,
        data: newEvent
      });
    } catch (error) {
      console.error('创建地图事件失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   GET /api/events/:id
 * @desc    获取单个地图事件
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await MapEvent.findById(req.params.id)
      .where('is_deleted').equals(false);
    
    if (!event) {
      return res.status(404).json({ success: false, error: '未找到该事件' });
    }
    
    // 增加浏览次数
    event.views_count += 1;
    await event.save();
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('获取地图事件失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/events/:id/like
 * @desc    点赞地图事件
 * @access  Public
 */
router.put('/:id/like', async (req, res) => {
  try {
    const event = await MapEvent.findById(req.params.id)
      .where('is_deleted').equals(false);
    
    if (!event) {
      return res.status(404).json({ success: false, error: '未找到该事件' });
    }
    
    // 增加点赞数
    event.likes_count += 1;
    await event.save();
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    删除地图事件
 * @access  Private/Admin
 */
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const event = await MapEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, error: '未找到该事件' });
    }
    
    // 软删除
    event.is_deleted = true;
    await event.save();
    
    res.json({
      success: true,
      message: '事件已删除'
    });
  } catch (error) {
    console.error('删除地图事件失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/events/:id/status
 * @desc    更新地图事件状态
 * @access  Private/Admin
 */
router.put('/:id/status', [protect, authorize('admin')], async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: '无效的状态值' });
    }
    
    const event = await MapEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, error: '未找到该事件' });
    }
    
    event.status = status;
    await event.save();
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('更新事件状态失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

module.exports = router;