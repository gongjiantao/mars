const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../server/models/User');
const Post = require('../server/models/Post');
const Comment = require('../server/models/Comment');
const Event = require('../server/models/Event');
const MapEvent = require('../server/models/MapEvent');
const Badge = require('../server/models/Badge');
const Profile = require('../server/models/Profile');
const Work = require('../server/models/Work');
const Award = require('../server/models/Award');
const AntiViolenceCase = require('../server/models/AntiViolenceCase');

// 加载环境变量
dotenv.config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mars_music', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

// 显示数据库概览
const showOverview = async () => {
  try {
    console.log('\n🌟 火星社区数据库概览\n');
    
    // 用户统计
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    console.log('👥 用户模块:');
    console.log(`   总用户数: ${totalUsers}`);
    console.log(`   活跃用户: ${activeUsers}`);
    console.log(`   管理员: ${adminUsers}`);
    
    // 火星树洞统计
    const totalPosts = await Post.countDocuments();
    const activePosts = await Post.countDocuments({ deleted: { $ne: true } });
    const totalComments = await Comment.countDocuments();
    
    console.log('\n📝 火星树洞:');
    console.log(`   总帖子数: ${totalPosts}`);
    console.log(`   活跃帖子: ${activePosts}`);
    console.log(`   总评论数: ${totalComments}`);
    
    // 公益地图统计
    const totalMapEvents = await MapEvent.countDocuments();
    const activeMapEvents = await MapEvent.countDocuments({ deleted: { $ne: true } });
    
    console.log('\n🗺️  公益地图:');
    console.log(`   总事件数: ${totalMapEvents}`);
    console.log(`   活跃事件: ${activeMapEvents}`);
    
    // 挑战赛统计
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'active' });
    

    
    // 反网暴统计
    const totalCases = await AntiViolenceCase.countDocuments();
    const pendingCases = await AntiViolenceCase.countDocuments({ status: 'pending' });
    
    console.log('\n🛡️  反网暴:');
    console.log(`   总案例数: ${totalCases}`);
    console.log(`   待处理: ${pendingCases}`);
    
    // 其他统计
    const totalBadges = await Badge.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const totalWorks = await Work.countDocuments();
    const totalAwards = await Award.countDocuments();
    
    console.log('\n🎖️  其他数据:');
    console.log(`   勋章数: ${totalBadges}`);
    console.log(`   歌手资料: ${totalProfiles}`);
    console.log(`   作品数: ${totalWorks}`);
    console.log(`   获奖记录: ${totalAwards}`);
    
  } catch (error) {
    console.error('❌ 查询概览失败:', error);
  }
};

// 显示最近活动
const showRecentActivity = async () => {
  try {
    console.log('\n📈 最近活动 (近7天)\n');
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // 新用户
    const newUsers = await User.countDocuments({
      created_at: { $gte: sevenDaysAgo }
    });
    
    // 新帖子
    const newPosts = await Post.countDocuments({
      created_at: { $gte: sevenDaysAgo },
      deleted: { $ne: true }
    });
    
    // 新评论
    const newComments = await Comment.countDocuments({
      created_at: { $gte: sevenDaysAgo }
    });
    
    // 新地图事件
    const newMapEvents = await MapEvent.countDocuments({
      created_at: { $gte: sevenDaysAgo },
      deleted: { $ne: true }
    });
    
    console.log('🆕 新增数据:');
    console.log(`   新用户: ${newUsers}`);
    console.log(`   新帖子: ${newPosts}`);
    console.log(`   新评论: ${newComments}`);
    console.log(`   新地图事件: ${newMapEvents}`);
    
    // 最活跃用户
    const activeUserPosts = await Post.aggregate([
      {
        $match: {
          created_at: { $gte: sevenDaysAgo },
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);
    
    if (activeUserPosts.length > 0) {
      console.log('\n🔥 最活跃用户 (按发帖数):');
      activeUserPosts.forEach((item, index) => {
        const user = item.user[0];
        console.log(`   ${index + 1}. ${user?.nickname || user?.username || '匿名用户'} - ${item.postCount} 帖`);
      });
    }
    
  } catch (error) {
    console.error('❌ 查询最近活动失败:', error);
  }
};

// 数据库健康检查
const healthCheck = async () => {
  try {
    console.log('\n🏥 数据库健康检查\n');
    
    const issues = [];
    
    // 检查孤立评论
    const orphanComments = await Comment.countDocuments({
      post: { $nin: await Post.find().distinct('_id') }
    });
    if (orphanComments > 0) {
      issues.push(`发现 ${orphanComments} 条孤立评论`);
    }
    
    // 检查帖子评论数不一致
    const posts = await Post.find().select('_id comment_count');
    let inconsistentPosts = 0;
    for (const post of posts) {
      const actualCount = await Comment.countDocuments({ post: post._id });
      if (post.comment_count !== actualCount) {
        inconsistentPosts++;
      }
    }
    if (inconsistentPosts > 0) {
      issues.push(`发现 ${inconsistentPosts} 个帖子的评论数不一致`);
    }
    
    // 检查无效用户引用
    const invalidUserPosts = await Post.countDocuments({
      author: { $nin: await User.find().distinct('_id') }
    });
    if (invalidUserPosts > 0) {
      issues.push(`发现 ${invalidUserPosts} 个帖子引用了不存在的用户`);
    }
    
    // 检查重复数据
    const duplicateUsers = await User.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    if (duplicateUsers.length > 0) {
      issues.push(`发现 ${duplicateUsers.length} 个重复邮箱`);
    }
    
    if (issues.length === 0) {
      console.log('✅ 数据库状态良好，未发现问题');
    } else {
      console.log('⚠️  发现以下问题:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log('\n💡 建议运行: node scripts/manage-database.js repair');
    }
    
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
  }
};

// 修复数据库问题
const repairDatabase = async () => {
  try {
    console.log('\n🔧 开始修复数据库问题...\n');
    
    let fixedCount = 0;
    
    // 删除孤立评论
    const orphanComments = await Comment.find({
      post: { $nin: await Post.find().distinct('_id') }
    });
    if (orphanComments.length > 0) {
      await Comment.deleteMany({
        post: { $nin: await Post.find().distinct('_id') }
      });
      console.log(`✅ 删除了 ${orphanComments.length} 条孤立评论`);
      fixedCount++;
    }
    
    // 修复帖子评论数
    const posts = await Post.find().select('_id comment_count');
    let updatedPosts = 0;
    for (const post of posts) {
      const actualCount = await Comment.countDocuments({ post: post._id });
      if (post.comment_count !== actualCount) {
        await Post.findByIdAndUpdate(post._id, { comment_count: actualCount });
        updatedPosts++;
      }
    }
    if (updatedPosts > 0) {
      console.log(`✅ 修复了 ${updatedPosts} 个帖子的评论数`);
      fixedCount++;
    }
    
    // 删除引用无效用户的帖子
    const validUserIds = await User.find().distinct('_id');
    const invalidPosts = await Post.find({
      author: { $nin: validUserIds }
    });
    if (invalidPosts.length > 0) {
      await Post.updateMany(
        { author: { $nin: validUserIds } },
        { deleted: true, deleted_at: new Date() }
      );
      console.log(`✅ 软删除了 ${invalidPosts.length} 个引用无效用户的帖子`);
      fixedCount++;
    }
    
    if (fixedCount === 0) {
      console.log('✅ 数据库状态良好，无需修复');
    } else {
      console.log(`\n🎉 修复完成，共处理了 ${fixedCount} 类问题`);
    }
    
  } catch (error) {
    console.error('❌ 修复数据库失败:', error);
  }
};

// 备份数据库
const backupDatabase = async () => {
  try {
    console.log('\n💾 开始备份数据库...\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `./backups/backup-${timestamp}`;
    
    console.log('📋 备份统计:');
    
    // 导出各个集合的数据
    const collections = [
      { name: 'users', model: User },
      { name: 'posts', model: Post },
      { name: 'comments', model: Comment },
      { name: 'events', model: Event },
      { name: 'mapevents', model: MapEvent },
      { name: 'badges', model: Badge },
      { name: 'profiles', model: Profile },
      { name: 'works', model: Work },
      { name: 'awards', model: Award }
    ];
    
    for (const collection of collections) {
      const count = await collection.model.countDocuments();
      console.log(`   ${collection.name}: ${count} 条记录`);
    }
    
    console.log('\n💡 建议使用 mongodump 命令进行完整备份:');
    console.log(`   mongodump --uri="${process.env.MONGO_URI || 'mongodb://localhost:27017/mars_music'}" --out=${backupDir}`);
    
  } catch (error) {
    console.error('❌ 备份失败:', error);
  }
};

// 清理旧数据
const cleanupOldData = async (days = 30) => {
  try {
    console.log(`\n🧹 清理 ${days} 天前的旧数据...\n`);
    
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 清理已删除的帖子
    const oldDeletedPosts = await Post.countDocuments({
      deleted: true,
      deleted_at: { $lt: cutoffDate }
    });
    
    if (oldDeletedPosts > 0) {
      console.log(`⚠️  发现 ${oldDeletedPosts} 个超过 ${days} 天的已删除帖子`);
      console.log('💡 建议手动确认后删除，或使用 permanent-cleanup 命令');
    } else {
      console.log('✅ 没有需要清理的旧数据');
    }
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  }
};

// 显示帮助信息
const showHelp = () => {
  console.log('\n🚀 火星社区数据库管理工具');
  console.log('\n📖 使用方法:');
  console.log('   node scripts/manage-database.js [命令] [选项]');
  console.log('\n🎯 可用命令:');
  console.log('   overview                查看数据库概览');
  console.log('   activity                查看最近活动');
  console.log('   health                  数据库健康检查');
  console.log('   repair                  修复数据库问题');
  console.log('   backup                  备份数据库');
  console.log('   cleanup [days]          清理旧数据 (默认30天)');
  console.log('   help                    显示帮助信息');
  console.log('\n🔧 专用管理脚本:');
  console.log('   node scripts/manage-posts.js      管理火星树洞');
  console.log('   node scripts/manage-events.js     管理地图事件');
  console.log('   node db-manager.js                管理用户数据');
  console.log('\n💡 示例:');
  console.log('   node scripts/manage-database.js overview');
  console.log('   node scripts/manage-database.js health');
  console.log('   node scripts/manage-database.js cleanup 60');
  console.log('\n⚠️  注意事项:');
  console.log('   - repair 命令会自动修复发现的问题');
  console.log('   - 建议定期运行 health 检查数据库状态');
  console.log('   - 重要操作前请先备份数据库');
};

// 主函数
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  await connectDB();
  
  try {
    switch (command) {
      case 'overview':
        await showOverview();
        break;
        
      case 'activity':
        await showRecentActivity();
        break;
        
      case 'health':
        await healthCheck();
        break;
        
      case 'repair':
        await repairDatabase();
        break;
        
      case 'backup':
        await backupDatabase();
        break;
        
      case 'cleanup':
        const days = parseInt(args[1]) || 30;
        await cleanupOldData(days);
        break;
        
      default:
        console.log(`❌ 未知命令: ${command}`);
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
  }
};

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});