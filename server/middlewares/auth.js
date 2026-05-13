const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 保护路由中间件 - 验证用户是否已登录
 */
exports.protect = async (req, res, next) => {
  let token;
  
  // 从请求头获取令牌
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 也可以从cookie获取令牌
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }
  
  // 检查令牌是否存在
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '未授权访问，请登录'
    });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mars_music_secret_key');
    
    // 查找用户
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '找不到该用户'
      });
    }
    
    // 检查账户状态
    if (user.status === 'disabled') {
      return res.status(401).json({
        success: false,
        error: '账户已被禁用，请联系管理员'
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    console.log('认证成功，用户信息:', { id: user._id, username: user.username, role: user.role });
    next();
  } catch (error) {
    console.error('令牌验证失败:', error);
    return res.status(401).json({
      success: false,
      error: '未授权访问，请登录'
    });
  }
};

/**
 * 授权中间件 - 检查用户角色
 * @param {...String} roles - 允许访问的角色
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问，请登录'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: '您没有权限执行此操作'
      });
    }
    
    next();
  };
};

/**
 * 可选认证中间件 - 如果有令牌则验证，没有则继续
 */
exports.optionalAuth = async (req, res, next) => {
  let token;
  
  // 从请求头获取令牌
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // 如果没有令牌，继续下一步
  if (!token) {
    return next();
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mars_music_secret_key');
    
    // 查找用户
    const user = await User.findById(decoded.id);
    
    if (user && user.status !== 'disabled') {
      // 将用户信息添加到请求对象
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 令牌无效，但仍继续处理请求
    console.error('可选认证令牌验证失败:', error);
    next();
  }
};

/**
 * 验证邮箱中间件 - 检查用户是否已验证邮箱
 */
exports.verifiedOnly = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      error: '请先验证您的邮箱'
    });
  }
  
  next();
};