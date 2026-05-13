# 🌍 Mars - 火星基地粉丝社区平台

一个为火星人（华晨宇粉丝）打造的全功能粉丝社区平台，集社区互动、反暴力倡导、挑战活动、地图事件于一体。

## ✨ 功能特性

- **🏠 社区动态** — 浏览粉丝发布的内容，发布帖子、点赞、评论互动
- **🎯 挑战活动** — 参与各种主题活动，提交作品，投票评选
- **🛡️ 反暴力倡导** — 反暴力案例展示与宣传教育
- **🗺️ 煤球地图** — 基于 Leaflet 的交互式地图，标记火星相关事件
- **💬 私信系统** — 用户之间实时私信交流（Socket.io）
- **👤 用户系统** — 注册、登录、找回密码、个人主页、资料编辑
- **🏆 成就系统** — 徽章与奖励机制，激励用户参与
- **🔒 安全防护** — Helmet 安全头、XSS 防护、MongoDB 注入防护、速率限制
- **📧 邮件通知** — 支持通过 Nodemailer 发送验证邮件

## 🛠️ 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| React 18 | 用户界面框架 |
| Redux Toolkit | 状态管理 |
| Material UI (MUI) | UI 组件库 |
| React Router v6 | 前端路由 |
| Axios | HTTP 请求 |
| Socket.io-client | 实时通信 |
| Leaflet / react-leaflet | 地图功能 |
| Moment.js | 时间处理 |

### 后端

| 技术 | 说明 |
|------|------|
| Express.js | Web 框架 |
| MongoDB / Mongoose | 数据库与 ODM |
| JWT (jsonwebtoken) | 用户认证 |
| Socket.io | WebSocket 实时通信 |
| Redis | 缓存与投票限制 |
| Multer + Sharp | 文件上传与图片处理 |
| Nodemailer | 邮件发送 |
| Helmet | 安全 HTTP 头 |
| node-cron | 定时任务 |

## 📁 项目结构

```
mars/
├── client/                  # React 前端
│   ├── public/              # 静态资源
│   │   ├── audio/           # 音频文件
│   │   ├── img/             # 图片资源
│   │   └── video/           # 视频文件
│   └── src/
│       ├── components/      # 公共组件
│       │   ├── auth/        # 认证相关组件
│       │   ├── common/      # 通用组件
│       │   ├── effects/     # 特效组件
│       │   ├── emojis/      # 表情组件
│       │   ├── icons/       # 图标组件
│       │   └── layout/      # 布局组件
│       ├── config/          # API 配置
│       ├── pages/           # 页面组件
│       │   ├── anti-violence/  # 反暴力页面
│       │   ├── auth/        # 认证页面
│       │   ├── challenges/  # 挑战页面
│       │   ├── events/      # 活动页面
│       │   ├── messages/    # 私信页面
│       │   ├── posts/       # 帖子页面
│       │   └── profile/     # 个人主页
│       ├── redux/           # Redux 状态管理
│       ├── store/           # Redux Toolkit Store
│       ├── styles/          # 样式文件
│       └── utils/           # 工具函数
├── server/                  # Express 后端
│   ├── controllers/         # 控制器
│   ├── middlewares/         # 中间件
│   ├── models/              # Mongoose 数据模型
│   ├── public/              # 静态资源
│   │   ├── img/             # 图片
│   │   └── uploads/         # 用户上传文件
│   ├── routes/              # API 路由
│   ├── socket/              # Socket.io 配置
│   └── utils/               # 工具函数
├── scripts/                 # 管理脚本
├── .env.example             # 环境变量示例
├── package.json             # 项目配置
└── README.md
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 14.0.0
- **MongoDB** >= 5.0
- **Redis** >= 6.0（可选，用于挑战投票限制）

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/gongjiantao/mars.git
cd mars
```

2. **安装依赖**

```bash
# 安装根目录依赖（后端）
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 安装脚本依赖
cd scripts
npm install
cd ..
```

3. **配置环境变量**

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mars_music
JWT_SECRET=你的JWT密钥
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@marsmusic.com
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **初始化数据库（可选）**

```bash
npm run data:import
```

5. **启动开发服务器**

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run server   # 后端 http://localhost:5000
npm run client   # 前端 http://localhost:3000
```

## 📡 API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/forgot-password` | 忘记密码 |
| PUT | `/api/auth/reset-password` | 重置密码 |

### 帖子

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取帖子列表 |
| GET | `/api/posts/:id` | 获取帖子详情 |
| POST | `/api/posts` | 创建帖子 |
| PUT | `/api/posts/:id` | 更新帖子 |
| DELETE | `/api/posts/:id` | 删除帖子 |
| PUT | `/api/posts/:id/like` | 点赞帖子 |

### 挑战

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/challenges` | 获取挑战列表 |
| GET | `/api/challenges/:id` | 获取挑战详情 |
| POST | `/api/challenges/:id/submit` | 提交挑战作品 |

### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/profile` | 获取个人资料 |
| PUT | `/api/profile` | 更新个人资料 |

### 私信

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/messages/conversations` | 获取会话列表 |
| POST | `/api/messages/send` | 发送消息 |

## 🔒 安全特性

- **Helmet** — 安全 HTTP 响应头
- **express-mongo-sanitize** — 防止 MongoDB 注入
- **xss-clean** — 防止 XSS 攻击
- **hpp** — 防止 HTTP 参数污染
- **express-rate-limit** — API 请求速率限制
- **JWT** — 无状态身份认证
- **bcryptjs** — 密码哈希存储

## 📜 可用脚本

```bash
npm run dev           # 同时启动前后端开发服务器
npm run server        # 启动后端（nodemon 热重载）
npm run client        # 启动前端开发服务器
npm test              # 运行测试
npm run data:import   # 导入种子数据
npm run data:destroy  # 清除种子数据
```

## 📄 License

MIT
