const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const dotenv = require('dotenv');
const cron = require('node-cron');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 连接数据库
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mars_music', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB连接成功');
  
  // 启动定时任务来自动更新过期挑战的状态
  startChallengeStatusUpdater();
})
.catch(err => console.error('MongoDB连接失败:', err));

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-domain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
})); // 安全HTTP头
app.use(morgan('dev')); // 日志

// 数据清理
app.use(mongoSanitize()); // 防止MongoDB注入
app.use(xss()); // 防止XSS攻击
app.use(hpp()); // 防止HTTP参数污染

// 限制请求速率
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10分钟
  max: 100, // 每个IP最多100个请求
  message: { success: false, error: '请求过于频繁，请稍后再试' }
});

// 为帖子API设置更宽松的限制
const postsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 30, // 每个IP每分钟最多30个请求
  message: { success: false, error: '请求过于频繁，请稍后再试' }
});

// 添加全局请求日志
app.use((req, res, next) => {
  if (req.path === '/api/events' && req.method === 'POST') {
    console.log('=== 全局中间件捕获 POST /api/events ===');
    console.log('请求时间:', new Date().toISOString());
    console.log('请求头:', req.headers);
    console.log('请求体类型:', typeof req.body);
  }
  next();
});


app.use('/uploads', express.static('/home/mars/apps/mars-singer-community/public/uploads'));

// 添加调试中间件
app.use('/uploads', (req, res, next) => {
  console.log('访问静态文件:', req.url);
  console.log('完整路径:', '/home/mars/apps/mars-singer-community/public/uploads' + req.url);
  
  // 检查文件是否存在
  const fs = require('fs');
  const fullPath = '/home/mars/apps/mars-singer-community/public/uploads' + req.url;
  
  if (fs.existsSync(fullPath)) {
    console.log('文件存在:', fullPath);
  } else {
    console.log('文件不存在:', fullPath);
  }
  
  next();
});

// 添加专门的图片路由用于调试
app.get('/uploads/map-events/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads/map-events', filename);
  
  console.log('请求图片:', filename);
  console.log('文件路径:', filePath);
  
  // 检查文件是否存在
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.error('图片文件不存在:', filePath);
    res.status(404).json({ error: '图片不存在' });
  }
});

// 导入模型
const ChallengeTheme = require('./models/ChallengeTheme');

// 定时任务：自动更新过期挑战的状态
function startChallengeStatusUpdater() {
  // 每小时执行一次检查
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      console.log(`[${now.toISOString()}] 开始检查过期挑战...`);
      
      // 查找所有已过期但仍标记为活跃的挑战
      const expiredChallenges = await ChallengeTheme.find({
        endDate: { $lt: now },
        isActive: true
      });
      
      if (expiredChallenges.length > 0) {
        console.log(`发现 ${expiredChallenges.length} 个过期挑战，正在更新状态...`);
        
        // 批量更新过期挑战的状态
        const result = await ChallengeTheme.updateMany(
          {
            endDate: { $lt: now },
            isActive: true
          },
          {
            $set: { isActive: false }
          }
        );
        
        console.log(`成功更新 ${result.modifiedCount} 个挑战的状态为非活跃`);
        
        // 记录被更新的挑战
        expiredChallenges.forEach(challenge => {
          console.log(`- 挑战 "${challenge.title}" (ID: ${challenge._id}) 已标记为非活跃`);
        });
      } else {
        console.log('没有发现过期的活跃挑战');
      }
    } catch (error) {
      console.error('更新挑战状态时发生错误:', error);
    }
  });
  
  console.log('挑战状态自动更新定时任务已启动 (每小时执行一次)');
  
  // 立即执行一次检查
  setTimeout(async () => {
    try {
      const now = new Date();
      console.log(`[${now.toISOString()}] 执行初始挑战状态检查...`);
      
      const expiredChallenges = await ChallengeTheme.find({
        endDate: { $lt: now },
        isActive: true
      });
      
      if (expiredChallenges.length > 0) {
        console.log(`发现 ${expiredChallenges.length} 个过期挑战，正在更新状态...`);
        
        const result = await ChallengeTheme.updateMany(
          {
            endDate: { $lt: now },
            isActive: true
          },
          {
            $set: { isActive: false }
          }
        );
        
        console.log(`初始检查：成功更新 ${result.modifiedCount} 个挑战的状态为非活跃`);
      } else {
        console.log('初始检查：没有发现过期的活跃挑战');
      }
    } catch (error) {
      console.error('初始挑战状态检查时发生错误:', error);
    }
  }, 5000); // 5秒后执行初始检查
}

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/works', require('./routes/works'));
app.use('/api/awards', require('./routes/awards'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/events', require('./routes/events'));
app.use('/api/badges', require('./routes/badges'));

app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/anti-violence-cases', require('./routes/antiViolenceCases'));
app.use('/api/encouragements', require('./routes/encouragements'));
app.use('/api/anti-violence', require('./routes/antiViolence'));
app.use('/api/fan-messages', require('./routes/fanMessages'));
app.use('/api/detection-records', require('./routes/detectionRecords'));
app.use('/api/messages', require('./routes/messages'));

// 服务静态文件（React构建文件）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // 处理React路由，返回index.html
  app.get('*', (req, res) => {
    // 排除API路由
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return res.status(404).json({ success: false, error: '未找到请求的资源' });
    }
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // 开发环境下的404处理
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, error: '未找到请求的资源' });
    }
    res.status(404).json({ success: false, error: '未找到请求的资源' });
  });
}

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || '服务器错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});