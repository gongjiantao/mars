const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Work = require('../models/Work');
const { protect, authorize } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB限制
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = /jpeg|jpg|png|gif|mp3|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片、音频和视频文件！'));
    }
  }
});

/**
 * @route   GET /api/works
 * @desc    获取所有作品
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { type, limit = 10, page = 1, sort = '-release_date' } = req.query;
    
    // 构建查询条件
    const query = {};
    if (type) query.type = type;
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询作品
    const works = await Work.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Work.countDocuments(query);
    
    res.json({
      success: true,
      count: works.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: works
    });
  } catch (error) {
    console.error('获取作品失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/works/:id
 * @desc    获取单个作品
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({ success: false, error: '未找到该作品' });
    }
    
    res.json({
      success: true,
      data: work
    });
  } catch (error) {
    console.error('获取作品失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该作品' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/works
 * @desc    创建新作品
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    upload.fields([
      { name: 'cover_img', maxCount: 1 },
      { name: 'preview_file', maxCount: 1 },
      { name: 'track_files', maxCount: 20 }
    ]),
    [
      check('type', '作品类型不能为空').isIn(['song', 'video', 'album']),
      check('title', '标题不能为空').not().isEmpty(),
      check('release_date', '发布日期不能为空').not().isEmpty()
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
        type,
        title,
        release_date,
        description,
        duration,
        lyrics,
        video_url,
        video_platform,
        video_id,
        tags,
        featured_artists
      } = req.body;
      
      // 创建新作品对象
      const newWork = new Work({
        type,
        title,
        release_date,
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        featured_artists: featured_artists ? featured_artists.split(',').map(artist => artist.trim()) : []
      });
      
      // 处理封面图片
      if (req.files && req.files.cover_img) {
        const coverImgPath = `/uploads/${req.files.cover_img[0].filename}`;
        newWork.cover_img = coverImgPath;
      } else if (!req.body.cover_img) {
        return res.status(400).json({ success: false, error: '封面图片是必需的' });
      } else {
        newWork.cover_img = req.body.cover_img;
      }
      
      // 根据作品类型处理特定字段
      if (type === 'song') {
        // 处理预览音频
        if (req.files && req.files.preview_file) {
          const previewPath = `/uploads/${req.files.preview_file[0].filename}`;
          newWork.preview_url = previewPath;
        } else if (req.body.preview_url) {
          newWork.preview_url = req.body.preview_url;
        }
        
        if (duration) newWork.duration = duration;
        if (lyrics) newWork.lyrics = lyrics;
      } else if (type === 'video') {
        if (video_url) newWork.video_url = video_url;
        if (video_platform) newWork.video_platform = video_platform;
        if (video_id) newWork.video_id = video_id;
        if (duration) newWork.duration = duration;
      } else if (type === 'album') {
        // 处理专辑曲目
        if (req.body.tracks) {
          try {
            newWork.tracks = JSON.parse(req.body.tracks);
          } catch (e) {
            return res.status(400).json({ success: false, error: '曲目格式不正确' });
          }
        } else {
          newWork.tracks = [];
        }
        
        // 处理上传的曲目文件
        if (req.files && req.files.track_files && newWork.tracks.length > 0) {
          req.files.track_files.forEach((file, index) => {
            if (index < newWork.tracks.length) {
              newWork.tracks[index].preview_url = `/uploads/${file.filename}`;
            }
          });
        }
      }
      
      // 保存作品
      await newWork.save();
      
      res.status(201).json({
        success: true,
        data: newWork
      });
    } catch (error) {
      console.error('创建作品失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   PUT /api/works/:id
 * @desc    更新作品
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    protect,
    authorize('admin'),
    upload.fields([
      { name: 'cover_img', maxCount: 1 },
      { name: 'preview_file', maxCount: 1 },
      { name: 'track_files', maxCount: 20 }
    ])
  ],
  async (req, res) => {
    try {
      let work = await Work.findById(req.params.id);
      
      if (!work) {
        return res.status(404).json({ success: false, error: '未找到该作品' });
      }
      
      // 更新字段
      const updateFields = {};
      const fields = [
        'title', 'release_date', 'description', 'duration',
        'lyrics', 'video_url', 'video_platform', 'video_id'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateFields[field] = req.body[field];
        }
      });
      
      // 处理标签和艺术家
      if (req.body.tags) {
        updateFields.tags = req.body.tags.split(',').map(tag => tag.trim());
      }
      
      if (req.body.featured_artists) {
        updateFields.featured_artists = req.body.featured_artists.split(',').map(artist => artist.trim());
      }
      
      // 处理封面图片
      if (req.files && req.files.cover_img) {
        updateFields.cover_img = `/uploads/${req.files.cover_img[0].filename}`;
      } else if (req.body.cover_img) {
        updateFields.cover_img = req.body.cover_img;
      }
      
      // 根据作品类型处理特定字段
      if (work.type === 'song') {
        // 处理预览音频
        if (req.files && req.files.preview_file) {
          updateFields.preview_url = `/uploads/${req.files.preview_file[0].filename}`;
        } else if (req.body.preview_url) {
          updateFields.preview_url = req.body.preview_url;
        }
      } else if (work.type === 'album') {
        // 处理专辑曲目
        if (req.body.tracks) {
          try {
            updateFields.tracks = JSON.parse(req.body.tracks);
          } catch (e) {
            return res.status(400).json({ success: false, error: '曲目格式不正确' });
          }
          
          // 处理上传的曲目文件
          if (req.files && req.files.track_files && updateFields.tracks.length > 0) {
            req.files.track_files.forEach((file, index) => {
              if (index < updateFields.tracks.length) {
                updateFields.tracks[index].preview_url = `/uploads/${file.filename}`;
              }
            });
          }
        }
      }
      
      // 更新时间
      updateFields.updated_at = Date.now();
      
      // 更新作品
      work = await Work.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
      
      res.json({
        success: true,
        data: work
      });
    } catch (error) {
      console.error('更新作品失败:', error);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, error: '未找到该作品' });
      }
      
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   DELETE /api/works/:id
 * @desc    删除作品
 * @access  Private/Admin
 */
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({ success: false, error: '未找到该作品' });
    }
    
    await work.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('删除作品失败:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: '未找到该作品' });
    }
    
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/works/type/:type
 * @desc    按类型获取作品
 * @access  Public
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10, page = 1, sort = '-release_date' } = req.query;
    
    // 验证类型
    if (!['song', 'video', 'album'].includes(type)) {
      return res.status(400).json({ success: false, error: '无效的作品类型' });
    }
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询作品
    const works = await Work.find({ type })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Work.countDocuments({ type });
    
    res.json({
      success: true,
      count: works.length,
      total,
      pagination: {
        current: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit))
      },
      data: works
    });
  } catch (error) {
    console.error('获取作品失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   GET /api/works/latest/:type/:count
 * @desc    获取最新的N个指定类型作品
 * @access  Public
 */
router.get('/latest/:type/:count', async (req, res) => {
  try {
    const { type, count } = req.params;
    
    // 验证类型
    if (!['song', 'video', 'album', 'all'].includes(type)) {
      return res.status(400).json({ success: false, error: '无效的作品类型' });
    }
    
    // 构建查询条件
    const query = type === 'all' ? {} : { type };
    
    // 查询最新作品
    const works = await Work.find(query)
      .sort('-release_date')
      .limit(parseInt(count));
    
    res.json({
      success: true,
      count: works.length,
      data: works
    });
  } catch (error) {
    console.error('获取最新作品失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   POST /api/works/initialize
 * @desc    初始化示例作品（仅在没有作品时使用）
 * @access  Private/Admin
 */
router.post(
  '/initialize',
  [protect, authorize('admin')],
  async (req, res) => {
    try {
      // 检查是否已存在作品
      const existingWorks = await Work.countDocuments();
      
      if (existingWorks > 0) {
        return res.status(400).json({
          success: false,
          error: '已存在作品，无法初始化'
        });
      }
      
      // 创建示例作品
      const sampleWorks = [
        {
          type: 'song',
          title: '烟火里的尘埃',
          release_date: '2015-05-20',
          description: '一首充满情感的歌曲，描述了平凡生活中的美好瞬间。',
          cover_img: '/img/works/firework.jpg',
          preview_url: '/audio/firework.mp3',
          duration: 253,
          lyrics: '有那么一个人/在梦的远方/等待我/穿过这烟火的尘埃...',
          tags: ['流行', '抒情'],
          featured_artists: []
        },
        {
          type: 'video',
          title: '2019年北京演唱会',
          release_date: '2019-10-01',
          description: '2019年国庆北京演唱会精彩片段。',
          cover_img: '/img/works/concert2019.jpg',
          video_platform: 'bilibili',
          video_id: 'BV1xx411c7mD',
          duration: 1800,
          tags: ['演唱会', '现场'],
          featured_artists: []
        },
        {
          type: 'album',
          title: '星辰大海',
          release_date: '2020-08-15',
          description: '首张个人专辑，收录12首原创歌曲。',
          cover_img: '/img/works/album1.jpg',
          tracks: [
            {
              title: '星辰大海',
              duration: 267,
              preview_url: '/audio/album1/track1.mp3'
            },
            {
              title: '逆光',
              duration: 241,
              preview_url: '/audio/album1/track2.mp3'
            },
            {
              title: '旅行的意义',
              duration: 258,
              preview_url: '/audio/album1/track3.mp3'
            }
          ],
          tags: ['专辑', '流行'],
          featured_artists: []
        }
      ];
      
      // 保存示例作品
      await Work.insertMany(sampleWorks);
      
      res.status(201).json({
        success: true,
        count: sampleWorks.length,
        message: '示例作品初始化成功'
      });
    } catch (error) {
      console.error('初始化示例作品失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

module.exports = router;