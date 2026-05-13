const { checkSensitiveWords } = require('../utils/sensitiveWords');
const AntiViolenceCase = require('../models/AntiViolenceCase');
const DetectionRecord = require('../models/DetectionRecord');
const GlobalStats = require('../models/GlobalStats');
const ReportRecord = require('../models/ReportRecord');

/**
 * 检测内容中的网络暴力敏感词
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.detectViolenceContent = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: '内容不能为空'
      });
    }
    const result = checkSensitiveWords(content);

    try {
      await GlobalStats.findOneAndUpdate(
        { type: 'global_detection_count' },
        { 
          $inc: { count: 1 },
          $set: { lastUpdated: new Date() }
        },
        { 
          upsert: true,
          new: true 
        }
      );
      
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'] || req.sessionID;
      const historyRecord = {
        content: String(content).substring(0, 100),
        detected: Boolean(result.hasSensitiveWords),
        detectedWords: Array.isArray(result.detectedWords) ? result.detectedWords.map(String) : [],
        type: String(result.type || 'none'),
        timestamp: new Date()
      };
      
      let query = {};
      let recordData = {};
      
      if (userId) {
        query = { userId };
        recordData = { userId };
      } else if (sessionId) {
        query = { sessionId, userId: { $exists: false } };
        recordData = { sessionId };
      }
      
      if (Object.keys(query).length > 0) {
        let record = await DetectionRecord.findOne(query);
        
        if (!record) {
          record = new DetectionRecord({
            ...recordData,
            detectionCount: 0,
            lastDetectionTime: new Date(),
            detectionHistory: [historyRecord]
          });
          await record.save();
        } else {
          record.lastDetectionTime = new Date();
          record.detectionHistory.push(historyRecord);
          await record.save();
        }
      }
    } catch (recordError) {
      console.error('更新检测记录失败:', recordError);
      console.error('错误详情:', recordError.message);
    }
    if (result.hasSensitiveWords) {
      try {
        await GlobalStats.findOneAndUpdate(
          { type: 'helped_users_count' },
          { 
            $inc: { count: 1 },
            $set: { lastUpdated: new Date() }
          },
          { 
            upsert: true,
            new: true 
          }
        );
      } catch (helpError) {
        console.error('更新帮助用户数量失败:', helpError);
      }
      let responseData = {
        success: true,
        detected: true,
        sanitizedContent: result.sanitizedMessage,
        detectedWords: result.detectedWords,
        type: result.type,
        suggestions: []
      };
      if (result.type === 'emotional' || result.type === 'mixed') {
        responseData.suggestions.push(
          '您的内容包含可能表达负面情绪的词语，建议使用更积极的表达方式。',
          '如果您正在经历困难，可以寻求专业心理咨询帮助。'
        );
      }

      if (result.type === 'violence' || result.type === 'mixed') {
        responseData.suggestions.push(
          '您的内容包含暴力相关词语，这可能违反社区规范。',
          '请避免使用暴力、威胁或攻击性的语言。'
        );
      }

      if (result.type === 'cyberViolence' || result.type === 'mixed') {
        responseData.suggestions.push(
          '您的内容包含网络暴力相关词语，这可能对他人造成伤害。',
          '请尊重他人，避免使用侮辱、诽谤或人身攻击的语言。',
          '良好的网络环境需要每个人的共同维护。'
        );
        try {
          const relatedCases = await AntiViolenceCase.find(
            { tags: { $in: result.detectedWords } },
            'title description type'
          ).limit(2);

          if (relatedCases.length > 0) {
            responseData.relatedCases = relatedCases;
          }
        } catch (caseError) {
          console.error('获取相关案例失败:', caseError);
        }
      }

      return res.json(responseData);
    } else {
      return res.json({
        success: true,
        detected: false,
        message: '内容检测通过，未发现敏感内容'
      });
    }
  } catch (error) {
    console.error('检测网络暴力内容失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
};

/**
 * 获取反网络暴力资源和建议
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAntiViolenceResources = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) {
      query.type = type;
    }
    const cases = await AntiViolenceCase.find(
      { ...query, is_featured: true },
      'title description type resources tags'
    ).limit(5);
    const resources = cases.reduce((acc, curr) => {
      if (curr.resources && curr.resources.length > 0) {
        return [...acc, ...curr.resources];
      }
      return acc;
    }, []);
    const uniqueResources = Array.from(
      new Map(resources.map(item => [item.title, item])).values()
    );
    const generalSuggestions = [
      '遇到网络暴力时，保持冷静，不要急于回应',
      '保存证据，包括截图、聊天记录等',
      '向平台举报不当内容',
      '严重情况下寻求法律援助',
      '关注自身心理健康，必要时寻求专业心理咨询'
    ];

    res.json({
      success: true,
      data: {
        cases,
        resources: uniqueResources,
        suggestions: generalSuggestions,
        helplines: [
          {
            name: '全国心理援助热线(24小时)',
            phone: '400-161-9995'
          },
          {
            name: '火星人热线(男)',
            phone: '191239101XX'
          },
          {
            name: '火星人热线(女)',
            phone: '13652415XXX'
          }
        ]
      }
    });
  } catch (error) {
    console.error('获取反网络暴力资源失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
};

/**
 * 获取反网络暴力全局统计数据
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getGlobalStats = async (req, res) => {
  try {
    const detectionStats = await GlobalStats.findOne({ type: 'global_detection_count' });
    const detectionCount = detectionStats ? detectionStats.count : 0;
    
    const processedReports = await ReportRecord.countDocuments({ 
      status: { $in: ['resolved', 'processing'] } 
    });
    const helpedUsers = Math.floor(detectionCount * 0.3 + processedReports * 0.8);
    const totalDetections = await DetectionRecord.aggregate([
      { $unwind: '$detectionHistory' },
      { $group: { 
          _id: null, 
          total: { $sum: 1 },
          detected: { 
            $sum: { 
              $cond: [{ $eq: ['$detectionHistory.detected', true] }, 1, 0] 
            }
          }
        }
      }
    ]);
    
    let accuracyRate = 85;
    if (totalDetections.length > 0 && totalDetections[0].total > 0) {
      const detectedRatio = totalDetections[0].detected / totalDetections[0].total;
      accuracyRate = Math.min(95, Math.max(75, 80 + detectedRatio * 15));
    }
    
    res.json({
      success: true,
      data: {
        detectionCount,
        helpedUsers,
        accuracyRate: Math.round(accuracyRate),
        processedReports,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('获取全局统计数据失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
};

/**
 * 提交网络暴力举报（更新版本）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.reportViolenceContent = async (req, res) => {
  try {
    const { content, type, platform, url, description } = req.body;

    if (!content || !type) {
      return res.status(400).json({
        success: false,
        error: '内容和类型为必填项'
      });
    }
    const result = checkSensitiveWords(content);
    const reportRecord = new ReportRecord({
      content,
      type,
      platform: platform || '未指定',
      url: url || '',
      description: description || '',
      userId: req.user ? req.user.id : null,
      sessionId: req.user ? null : (req.headers['x-session-id'] || req.sessionID),
      detectionResult: {
        hasSensitiveWords: result.hasSensitiveWords,
        type: result.type,
        detectedWords: result.detectedWords
      }
    });

    await reportRecord.save();

    res.status(201).json({
      success: true,
      message: '举报已提交，我们将尽快处理',
      reportId: reportRecord._id,
      detectionResult: {
        hasSensitiveWords: result.hasSensitiveWords,
        type: result.type,
        detectedWords: result.detectedWords
      }
    });
  } catch (error) {
    console.error('提交网络暴力举报失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
};