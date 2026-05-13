const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Schema } = mongoose;

const UserSchema = new Schema({
  // 用户名
  username: {
    type: String,
    required: [true, '请提供用户名'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  // 邮箱（可选）
  email: {
    type: String,
    unique: true,
    sparse: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '请提供有效的邮箱地址'
    ]
  },
  // 手机号（可选）
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: [
      /^1[3-9]\d{9}$/,
      '请提供有效的11位手机号码'
    ]
  },
  // 密码
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: [6, '密码至少需要6个字符'],
    select: false
  },
  // 昵称
  nickname: {
    type: String,
    default: function() {
      return this.username;
    }
  },
  // 头像
  avatar: {
    type: String,
    default: ''
  },
  // 个人简介
  bio: {
    type: String,
    default: '这个人很懒，什么都没有留下。'
  },
  // 位置
  location: {
    type: String,
    default: ''
  },
  // 个人网站
  website: {
    type: String,
    default: ''
  },
  // 角色
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  // 是否已验证
  is_verified: {
    type: Boolean,
    default: true
  },
  // 验证令牌
  verification_token: String,
  verification_token_expires: Date,
  reset_password_token: String,
  reset_password_token_expires: Date,
  // 最后登录时间
  last_login: {
    type: Date,
    default: null
  },
  // 状态
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  // 创建时间
  created_at: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updated_at: {
    type: Date,
    default: Date.now
  },
  // 用户偏好设置
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      show_email: {
        type: Boolean,
        default: false
      },
      show_activities: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'en-US'],
      default: 'zh-CN'
    }
  }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 密码验证方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成JWT令牌
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// 生成验证令牌
UserSchema.methods.generateVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.verification_token = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.verification_token_expires = Date.now() + 24 * 60 * 60 * 1000; // 24小时
  
  return verificationToken;
};

// 生成重置密码令牌
UserSchema.methods.generateResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.reset_password_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.reset_password_token_expires = Date.now() + 10 * 60 * 1000; // 10分钟
  
  return resetToken;
};

// 索引
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

module.exports = mongoose.model('User', UserSchema);
