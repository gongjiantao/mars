const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/auth');
const ChallengeTheme = require('../models/ChallengeTheme');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = '/home/mars/apps/mars-singer-community/server/public/uploads/challenges';
    console.log('目标上传路径:', uploadPath);
    
    if (!fs.existsSync(uploadPath)) {
      console.log('创建目录:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'challenge-' + uniqueSuffix + path.extname(file.originalname);
    console.log('生成文件名:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// @route   GET /api/challenges
// @desc    获取挑战赛列表
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status === 'active') {
      const now = new Date();
      query = {
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true
      };
    } else if (status === 'upcoming') {
      const now = new Date();
      query = {
        startDate: { $gt: now },
        isActive: true
      };
    } else if (status === 'ended') {
      const now = new Date();
      query = {
        endDate: { $lt: now }
      };
    }

    const challenges = await ChallengeTheme.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username avatar');

    const challengesWithSubmissions = await Promise.all(
      challenges.map(async (challenge) => {
        const submissionCount = await ChallengeSubmission.countDocuments({
          challengeTheme: challenge._id
        });
        
        const challengeData = challenge.toObject();
        challengeData.currentSubmissions = submissionCount;
        return challengeData;
      })
    );

    const total = await ChallengeTheme.countDocuments(query);

    res.json({
      success: true,
      data: challengesWithSubmissions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: challenges.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('获取挑战赛列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   GET /api/challenges/current
// @desc    获取当前月份的挑战赛
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const challenge = await ChallengeTheme.findOne({
      month: currentMonth,
      year: currentYear,
      isActive: true
    }).populate('createdBy', 'username avatar');

    if (!challenge) {
      return res.json({
        success: true,
        data: null,
        message: '本月暂无挑战赛'
      });
    }

    // 动态计算参与人数
    const submissionCount = await ChallengeSubmission.countDocuments({
      challengeTheme: challenge._id
    });

    const challengeData = challenge.toObject();
    challengeData.currentSubmissions = submissionCount;

    res.json({
      success: true,
      data: challengeData
    });
  } catch (error) {
    console.error('获取当前挑战赛失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   GET /api/challenges/:id
// @desc    获取挑战赛详情
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const challenge = await ChallengeTheme.findById(req.params.id)
      .populate('createdBy', 'username avatar');

    if (!challenge) {
      return res.status(404).json({ success: false, message: '挑战赛不存在' });
    }

    // 动态计算实际参与人数
    const actualSubmissions = await ChallengeSubmission.countDocuments({
      challengeTheme: req.params.id
    });

    // 更新挑战赛对象的参与人数
    const challengeData = challenge.toObject();
    challengeData.currentSubmissions = actualSubmissions;

    res.json({
      success: true,
      data: challengeData
    });
  } catch (error) {
    console.error('获取挑战赛详情失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   POST /api/challenges
// @desc    创建新的挑战赛（管理员功能）
// @access  Private/Admin
router.post('/', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      theme,
      startDate,
      endDate,
      month,
      year,
      rules,
      prizes
    } = req.body;

    // 验证必填字段
    if (!title || !description || !theme || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 验证日期
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: '结束日期必须晚于开始日期'
      });
    }

    // 检查同月是否已有挑战赛
    if (month && year) {
      const existingChallenge = await ChallengeTheme.findOne({
        month: parseInt(month),
        year: parseInt(year),
        isActive: true
      });

      if (existingChallenge) {
        return res.status(400).json({
          success: false,
          message: `${year}年${month}月已存在挑战赛`
        });
      }
    }

    // 调试信息
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user ? req.user.id : 'undefined');
    
    const challenge = new ChallengeTheme({
      title,
      description,
      theme,
      startDate: start,
      endDate: end,
      month: month ? parseInt(month) : start.getMonth() + 1,
      year: year ? parseInt(year) : start.getFullYear(),
      rules: rules || [],
      prizes: prizes || [],
      createdBy: req.user.id,
      isActive: true
    });
    
    console.log('创建的挑战赛对象:', challenge);

    await challenge.save();
    await challenge.populate('createdBy', 'username avatar');

    res.status(201).json({
      success: true,
      data: challenge,
      message: '挑战赛创建成功'
    });
  } catch (error) {
    console.error('创建挑战赛失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   PUT /api/challenges/:id
// @desc    更新挑战赛（管理员功能）
// @access  Private/Admin
router.put('/:id', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const challenge = await ChallengeTheme.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: '挑战赛不存在' });
    }

    const {
      title,
      description,
      theme,
      startDate,
      endDate,
      month,
      year,
      rules,
      prizes,
      isActive
    } = req.body;

    // 更新字段
    if (title) challenge.title = title;
    if (description) challenge.description = description;
    if (theme) challenge.theme = theme;
    if (startDate) challenge.startDate = new Date(startDate);
    if (endDate) challenge.endDate = new Date(endDate);
    if (month) challenge.month = parseInt(month);
    if (year) challenge.year = parseInt(year);
    if (rules) challenge.rules = rules;
    if (prizes) challenge.prizes = prizes;
    if (typeof isActive === 'boolean') challenge.isActive = isActive;

    challenge.updatedAt = new Date();
    await challenge.save();
    await challenge.populate('createdBy', 'username avatar');

    res.json({
      success: true,
      data: challenge,
      message: '挑战赛更新成功'
    });
  } catch (error) {
    console.error('更新挑战赛失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   DELETE /api/challenges/:id
// @desc    删除挑战赛（管理员功能）
// @access  Private/Admin
router.delete('/:id', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const challenge = await ChallengeTheme.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: '挑战赛不存在' });
    }

    // 删除相关的作品提交
    await ChallengeSubmission.deleteMany({ challengeId: req.params.id });

    // 直接删除挑战赛
    await ChallengeTheme.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '挑战赛删除成功'
    });
  } catch (error) {
    console.error('删除挑战赛失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   GET /api/challenges/:id/submissions
// @desc    获取挑战赛作品列表
// @access  Public
router.get('/:id/submissions', async (req, res) => {
  try {
    const { page = 1, limit = 9, sort = 'votes' } = req.query;
    const skip = (page - 1) * limit;
    const challengeId = req.params.id;

    // 验证挑战赛是否存在
    const challenge = await ChallengeTheme.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: '挑战赛不存在' });
    }

    let sortQuery = {};
    if (sort === 'votes') {
      sortQuery = { votes: -1, createdAt: -1 };
    } else if (sort === 'latest') {
      sortQuery = { createdAt: -1 };
    }

    const submissions = await ChallengeSubmission.find({
      challengeTheme: challengeId,
      status: { $in: ['approved', 'pending'] }
    })
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar')
      .populate('challengeTheme', 'title');

    // 如果用户已登录，检查是否已投票
    if (req.user) {
      submissions.forEach(submission => {
        submission.hasVoted = submission.voters.some(voter => voter.user.toString() === req.user.id);
      });
    }

    const total = await ChallengeSubmission.countDocuments({
      challengeTheme: challengeId,
      status: { $in: ['approved', 'pending'] }
    });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        count: submissions.length,
        total: total
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   GET /api/challenges/:id/my-submission
// @desc    获取用户在指定挑战中的提交
// @access  Private
router.get('/:id/my-submission', auth.protect, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;

    // 验证挑战赛是否存在
    const challenge = await ChallengeTheme.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: '挑战赛不存在' });
    }

    // 查找用户的提交
    const submission = await ChallengeSubmission.findOne({
      challengeTheme: challengeId,
      user: userId
    })
      .populate('user', 'username avatar')
      .populate('challengeTheme', 'title');

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('获取用户提交失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   POST /api/challenges/:id/submit
// @desc    提交挑战赛作品
// @access  Private
router.post('/:id/submit', auth.protect, (req, res, next) => {
  upload.array('photos', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: '图片文件过大，单个文件不能超过10MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: '最多只能上传5张图片'
        });
      }
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || '文件上传失败'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;
    const { title, description, phone, email } = req.body;

    // 验证必填字段
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: '请填写作品标题和描述'
      });
    }

    // 验证联系方式
    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: '请提供手机号或邮箱作为联系方式'
      });
    }

    // 验证挑战赛是否存在
    const challenge = await ChallengeTheme.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: '挑战赛不存在' });
    }

    // 检查挑战赛是否在进行中
    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      return res.status(400).json({
        success: false,
        message: '挑战赛不在进行时间内'
      });
    }

    // 检查用户是否已经提交过作品
    const existingSubmission = await ChallengeSubmission.findOne({
      challengeTheme: challengeId,
      user: userId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: '您已经提交过作品，每个挑战只能参加一次'
      });
    }

    // 处理上传的图片
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => ({
        url: `/uploads/challenges/${file.filename}`,
        uploadedAt: new Date()
      }));
    }

    // 验证至少上传一张图片
    if (photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请至少上传一张活动照片'
      });
    }

    // 创建提交记录
    const submission = new ChallengeSubmission({
      challengeTheme: challengeId,
      user: userId,
      title,
      description,
      contactInfo: {
        phone: phone || '',
        email: email || ''
      },
      photos,
      status: 'pending', // 待审核
      votes: 0,
      voters: []
    });

    console.log('准备保存作品:', submission);
    await submission.save();
    console.log('作品保存成功:', submission._id);
    
    await submission.populate('user', 'username avatar');
    await submission.populate('challengeTheme', 'title');

    res.status(201).json({
      success: true,
      data: submission,
      message: '作品提交成功，等待审核'
    });
  } catch (error) {
    console.error('提交作品失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   POST /api/challenges/submissions/:id/vote
// @desc    为作品投票
// @access  Private
router.post('/submissions/:id/vote', auth.protect, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.id;

    // 验证作品是否存在
    const submission = await ChallengeSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }

    // 检查用户是否已经投票
    const hasVoted = submission.voters.some(voter => voter.user.toString() === userId);
    if (hasVoted) {
      return res.status(400).json({ success: false, message: '您已经为该作品投过票了' });
    }

    // 检查用户是否为作品作者
    if (submission.user.toString() === userId) {
      return res.status(400).json({ success: false, message: '不能为自己的作品投票' });
    }

    // 添加投票
    await ChallengeSubmission.findByIdAndUpdate(submissionId, {
      $inc: { votes: 1 },
      $addToSet: { voters: { user: userId, votedAt: new Date() } }
    });

    res.json({
      success: true,
      message: '投票成功',
      data: {
        votes: submission.votes + 1,
        hasVoted: true
      }
    });
  } catch (error) {
    console.error('投票失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   DELETE /api/challenges/submissions/:id
// @desc    删除挑战赛作品（管理员功能）
// @access  Private/Admin
router.delete('/submissions/:id', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const submissionId = req.params.id;

    // 验证作品是否存在
    const submission = await ChallengeSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }

    // 软删除：设置状态为rejected
    await ChallengeSubmission.findByIdAndUpdate(submissionId, {
      status: 'rejected',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewNote: '管理员删除违规作品'
    });

    res.json({
      success: true,
      message: '作品删除成功'
    });
  } catch (error) {
    console.error('删除作品失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   DELETE /api/challenges/submissions/:id/vote
// @desc    取消作品投票
// @access  Private
router.delete('/submissions/:id/vote', auth.protect, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.id;

    // 验证作品是否存在
    const submission = await ChallengeSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }

    // 检查用户是否已经投票
    const hasVoted = submission.voters.some(voter => voter.user.toString() === userId);
    if (!hasVoted) {
      return res.status(400).json({ success: false, message: '您还没有为该作品投票' });
    }

    // 取消投票
    await ChallengeSubmission.findByIdAndUpdate(submissionId, {
      $inc: { votes: -1 },
      $pull: { voters: { user: userId } }
    });

    res.json({
      success: true,
      message: '取消投票成功',
      data: {
        votes: submission.votes - 1,
        hasVoted: false
      }
    });
  } catch (error) {
    console.error('取消投票失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 在现有路由后添加

// @route   GET /api/challenges/submissions/:id/admin
// @desc    管理员查看作品详情（包含联系信息）
// @access  Private/Admin
router.get('/submissions/:id/admin', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const submissionId = req.params.id;

    const submission = await ChallengeSubmission.findById(submissionId)
      .populate('user', 'username avatar email phone')
      .populate('challengeTheme', 'title');

    if (!submission) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }

    res.json({
      success: true,
      data: submission // 包含完整的contactInfo信息
    });
  } catch (error) {
    console.error('获取作品详情失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @route   GET /api/challenges/:id/submissions/admin
// @desc    管理员查看挑战赛所有作品（包含联系信息）
// @access  Private/Admin
router.get('/:id/submissions/admin', auth.protect, auth.authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const challengeId = req.params.id;

    const submissions = await ChallengeSubmission.find({
      challengeTheme: challengeId
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar email phone')
      .populate('challengeTheme', 'title');

    const total = await ChallengeSubmission.countDocuments({
      challengeTheme: challengeId
    });

    res.json({
      success: true,
      data: submissions, // 包含完整的contactInfo信息
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        count: submissions.length,
        total: total
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;