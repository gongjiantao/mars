const express = require('express');
const router = express.Router();
const DetectionRecord = require('../models/DetectionRecord');
const GlobalStats = require('../models/GlobalStats');
const { protect: auth } = require('../middlewares/auth');

/**
 * 获取全局检测次数（所有用户共享）
 * GET /api/detection-records/global
 */
router.get('/global', async (req, res) => {
  try {
    let globalStats = await GlobalStats.findOne({ type: 'global_detection_count' });
    
    if (!globalStats) {
      // 如果没有全局统计记录，创建一个新的
      globalStats = new GlobalStats({
        type: 'global_detection_count',
        count: 0
      });
      await globalStats.save();
    }
    
    res.json({
      success: true,
      data: {
        detectionCount: globalStats.count,
        lastUpdated: globalStats.lastUpdated
      }
    });
  } catch (error) {
    console.error('获取全局检测次数失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * 获取用户的检测记录（返回全局检测次数）
 * GET /api/detection-records
 */
router.get('/', auth, async (req, res) => {
  try {
    // 获取全局检测次数
    let globalStats = await GlobalStats.findOne({ type: 'global_detection_count' });
    
    if (!globalStats) {
      globalStats = new GlobalStats({
        type: 'global_detection_count',
        count: 0
      });
      await globalStats.save();
    }
    
    res.json({
      success: true,
      data: {
        detectionCount: globalStats.count, // 返回全局检测次数
        lastDetectionTime: globalStats.lastUpdated,
        totalDetections: globalStats.count
      }
    });
  } catch (error) {
    console.error('获取检测记录失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * 获取游客的检测记录（返回全局检测次数）
 * GET /api/detection-records/guest/:sessionId
 */
router.get('/guest/:sessionId', async (req, res) => {
  try {
    // 优先从请求头获取sessionId，如果没有则从URL参数获取
    const sessionId = req.headers['x-session-id'] || req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, error: '缺少sessionId' });
    }
    
    // 获取全局检测次数
    let globalStats = await GlobalStats.findOne({ type: 'global_detection_count' });
    
    if (!globalStats) {
      globalStats = new GlobalStats({
        type: 'global_detection_count',
        count: 0
      });
      await globalStats.save();
    }
    
    res.json({
      success: true,
      data: {
        detectionCount: globalStats.count, // 返回全局检测次数
        lastDetectionTime: globalStats.lastUpdated,
        totalDetections: globalStats.count
      }
    });
  } catch (error) {
    console.error('获取游客检测记录失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * 更新检测记录
 * POST /api/detection-records/update
 */
router.post('/update', async (req, res) => {
  try {
    const { content, detected, detectedWords, type, sessionId } = req.body;
    const userId = req.user?.id;
    
    let query = {};
    let updateData = {
      $inc: { detectionCount: 1 },
      $set: { lastDetectionTime: new Date() },
      $push: {
        detectionHistory: {
          content,
          detected,
          detectedWords: detectedWords || [],
          type,
          timestamp: new Date()
        }
      }
    };
    
    if (userId) {
      // 登录用户
      query = { userId };
      updateData.$setOnInsert = { userId };
    } else if (sessionId) {
      // 游客用户
      query = { sessionId, userId: { $exists: false } };
      updateData.$setOnInsert = { sessionId };
    } else {
      return res.status(400).json({ success: false, error: '缺少用户标识' });
    }
    
    const record = await DetectionRecord.findOneAndUpdate(
      query,
      updateData,
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      data: {
        detectionCount: record.detectionCount,
        lastDetectionTime: record.lastDetectionTime
      }
    });
  } catch (error) {
    console.error('更新检测记录失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

/**
 * 获取检测历史
 * GET /api/detection-records/history
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const record = await DetectionRecord.findOne({ userId });
    
    if (!record) {
      return res.json({
        success: true,
        data: {
          history: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const history = record.detectionHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        history,
        total: record.detectionHistory.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取检测历史失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

module.exports = router;