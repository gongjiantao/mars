const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Event = require('./models/Event');
const Badge = require('./models/Badge');
const Comment = require('./models/Comment');
const Profile = require('./models/Profile');
const Work = require('./models/Work');
const Award = require('./models/Award');

// 加载环境变量
dotenv.config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mars_music', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 查看所有用户
const showUsers = async () => {
  try {
    const users = await User.find({}).select('-password');
    console.log('\n=== 用户列表 ===');
    console.log(`总共 ${users.length} 个用户:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   昵称: ${user.nickname}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   状态: ${user.status || '正常'}`);
      console.log(`   注册时间: ${user.created_at || '未知'}`);
      console.log(`   头像: ${user.avatar}`);
      console.log('   ---');
    });
  } catch (error) {
    console.error('查询用户失败:', error);
  }
};

// 查看数据库统计信息
const showStats = async () => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const eventCount = await Event.countDocuments();
    const badgeCount = await Badge.countDocuments();
    const commentCount = await Comment.countDocuments();
    
    console.log('\n=== 数据库统计 ===');
    console.log(`用户数量: ${userCount}`);
    console.log(`帖子数量: ${postCount}`);
    console.log(`活动数量: ${eventCount}`);
    console.log(`勋章数量: ${badgeCount}`);
    console.log(`评论数量: ${commentCount}`);
  } catch (error) {
    console.error('查询统计信息失败:', error);
  }
};

// 根据用户名查找用户
const findUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username }).select('-password');
    if (user) {
      console.log('\n=== 用户详情 ===');
      console.log(`用户名: ${user.username}`);
      console.log(`邮箱: ${user.email}`);
      console.log(`昵称: ${user.nickname}`);
      console.log(`角色: ${user.role}`);
      console.log(`状态: ${user.status || '正常'}`);
      console.log(`个人简介: ${user.bio || '无'}`);
      console.log(`位置: ${user.location || '无'}`);
      console.log(`网站: ${user.website || '无'}`);
      console.log(`注册时间: ${user.created_at || '未知'}`);
      console.log(`最后登录: ${user.last_login || '未知'}`);
      console.log(`头像: ${user.avatar}`);
    } else {
      console.log(`未找到用户名为 "${username}" 的用户`);
    }
  } catch (error) {
    console.error('查询用户失败:', error);
  }
};

// 清除所有数据
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    await Event.deleteMany();
    await Badge.deleteMany();
    await Comment.deleteMany();
    await Profile.deleteMany();
    await Work.deleteMany();
    await Award.deleteMany();
    
    console.log('所有数据已清除');
  } catch (error) {
    console.error('清除数据失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  
  if (args.includes('-d') || args.includes('--destroy')) {
    await destroyData();
  } else if (args.includes('-s') || args.includes('--stats')) {
    await showStats();
  } else if (args.includes('-u') || args.includes('--users')) {
    await showUsers();
  } else if (args.includes('--find')) {
    const usernameIndex = args.indexOf('--find') + 1;
    if (usernameIndex < args.length) {
      await findUserByUsername(args[usernameIndex]);
    } else {
      console.log('请提供用户名: node seeder.js --find <username>');
    }
  } else {
    console.log('\n=== 火星音乐数据库管理工具 ===');
    console.log('使用方法:');
    console.log('  node seeder.js -u, --users     查看所有用户');
    console.log('  node seeder.js -s, --stats     查看数据库统计');
    console.log('  node seeder.js --find <用户名>  查找特定用户');
    console.log('  node seeder.js -d, --destroy   清除所有数据');
    console.log('\n数据库连接信息:');
    console.log(`  URI: ${process.env.MONGO_URI || 'mongodb://localhost:27017/mars_music'}`);
    console.log(`  数据库名: mars_music`);
  }
  
  process.exit(0);
};

// 运行主函数
main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});