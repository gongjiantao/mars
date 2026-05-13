const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  detectViolenceContent,
  getAntiViolenceResources,
  reportViolenceContent,
  getGlobalStats
} = require('../controllers/antiViolenceController');

/**
 * @route   POST /api/anti-violence/detect
 * @desc    检测内容中的网络暴力敏感词
 * @access  Public
 */
router.post('/detect', detectViolenceContent);

/**
 * @route   GET /api/anti-violence/resources
 * @desc    获取反网络暴力资源和建议
 * @access  Public
 */
router.get('/resources', getAntiViolenceResources);

/**
 * @route   GET /api/anti-violence/stats
 * @desc    获取反网络暴力全局统计数据
 * @access  Public
 */
router.get('/stats', getGlobalStats);

/**
 * @route   POST /api/anti-violence/report
 * @desc    提交网络暴力举报
 * @access  Private
 */
router.post('/report', protect, reportViolenceContent);

module.exports = router;