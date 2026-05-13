const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @route   GET /api/profile
 * @desc    获取歌手个人资料
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 获取个人资料（假设只有一个歌手资料）
    const profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(404).json({ success: false, error: '未找到个人资料' });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('获取个人资料失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    更新歌手个人资料
 * @access  Private/Admin
 */
router.put(
  '/',
  [
    protect,
    authorize('admin'),
    [
      check('birthday', '生日不能为空').not().isEmpty(),
      check('debut', '出道时间不能为空').not().isEmpty(),
      check('genre', '音乐风格不能为空').isArray().not().isEmpty(),
      check('fans_name', '粉丝名不能为空').not().isEmpty(),
      check('bio', '个人简介不能为空').not().isEmpty()
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
        birthday,
        debut,
        genre,
        fans_name,
        bio,
        avatar,
        cover_image,
        social_media
      } = req.body;
      
      // 构建个人资料对象
      const profileFields = {};
      if (birthday) profileFields.birthday = birthday;
      if (debut) profileFields.debut = debut;
      if (genre) profileFields.genre = genre;
      if (fans_name) profileFields.fans_name = fans_name;
      if (bio) profileFields.bio = bio;
      if (avatar) profileFields.avatar = avatar;
      if (cover_image) profileFields.cover_image = cover_image;
      if (social_media) profileFields.social_media = social_media;
      
      // 更新时间
      profileFields.updated_at = Date.now();
      
      // 查找并更新个人资料
      let profile = await Profile.findOne();
      
      if (profile) {
        // 更新现有资料
        profile = await Profile.findOneAndUpdate(
          { _id: profile._id },
          { $set: profileFields },
          { new: true }
        );
      } else {
        // 创建新资料
        profile = new Profile(profileFields);
        await profile.save();
      }
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('更新个人资料失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

/**
 * @route   POST /api/profile/initialize
 * @desc    初始化歌手个人资料（仅在没有资料时使用）
 * @access  Private/Admin
 */
router.post(
  '/initialize',
  [protect, authorize('admin')],
  async (req, res) => {
    try {
      // 检查是否已存在个人资料
      const existingProfile = await Profile.findOne();
      
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          error: '个人资料已存在，无法初始化'
        });
      }
      
      // 创建默认个人资料
      const defaultProfile = new Profile({
        birthday: '1990-02-07',
        debut: '2013-06-29',
        genre: ['Pop', 'Rock'],
        fans_name: '火星人',
        bio: '华语流行乐坛新生代实力唱将，以独特的嗓音和深情的演绎打动无数听众。',
        avatar: '/img/avatar.jpg',
        cover_image: '/img/cover.jpg',
        social_media: {
          weibo: 'https://weibo.com/mars',
          instagram: 'https://instagram.com/mars',
          twitter: 'https://twitter.com/mars',
          youtube: 'https://youtube.com/mars',
          bilibili: 'https://space.bilibili.com/mars'
        }
      });
      
      await defaultProfile.save();
      
      res.status(201).json({
        success: true,
        data: defaultProfile,
        message: '个人资料初始化成功'
      });
    } catch (error) {
      console.error('初始化个人资料失败:', error);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
);

module.exports = router;