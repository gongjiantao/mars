const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../server/models/Post');
const Comment = require('../server/models/Comment');
const User = require('../server/models/User');

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

// 查看所有帖子
const viewAllPosts = async (options = {}) => {
  try {
    const { page = 1, limit = 10, emotion, tag, sort = '-created_at' } = options;
    const query = { deleted: { $ne: true } };
    
    if (emotion) query.emotion = emotion;
    if (tag) query.tags = { $in: [tag] };
    
    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate('user_id', 'username nickname')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    console.log('\n📋 火星树洞帖子列表');
    console.log(`📊 总计: ${total} 个帖子 | 第 ${page}/${totalPages} 页\n`);
    
    posts.forEach((post, index) => {
        const num = skip + index + 1;
        console.log(`${num}. 📝 ${post.content ? post.content.substring(0, 50) + '...' : '无内容'}`);
        console.log(`   🆔 ID: ${post._id}`);
        console.log(`   👤 作者: ${post.user_id?.nickname || post.user_id?.username || '匿名用户'}`);
        console.log(`   😊 情绪: ${post.emotion_tag || '未知'}`);
        console.log(`   🏷️  标签: ${post.tags?.join(', ') || '无'}`);
        console.log(`   👍 点赞: ${post.likes || 0} | 💬 评论: ${post.comment_count || 0}`);
        console.log(`   📅 发布: ${post.created_at ? post.created_at.toLocaleString('zh-CN') : '未知'}`);
        console.log(`   📄 内容: ${post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : '无内容'}`);
        console.log('   ' + '─'.repeat(80));
      });
    
    if (totalPages > 1) {
      console.log(`\n💡 查看其他页面: node scripts/manage-posts.js view --page ${page + 1}`);
    }
  } catch (error) {
    console.error('❌ 查询帖子失败:', error);
  }
};

// 查看已删除的帖子
const viewDeletedPosts = async () => {
  try {
    const posts = await Post.find({ is_deleted: true })
      .populate('user_id', 'username nickname')
      .sort({ updated_at: -1 });
    
    console.log('\n🗑️  已删除的帖子列表');
    console.log(`📊 总计: ${posts.length} 个已删除帖子\n`);
    
    posts.forEach((post, index) => {
        console.log(`${index + 1}. 📝 ${post.content ? post.content.substring(0, 50) + '...' : '无内容'}`);
        console.log(`   🆔 ID: ${post._id}`);
        console.log(`   👤 作者: ${post.user_id?.nickname || post.user_id?.username || '匿名用户'}`);
        console.log(`   😊 情绪: ${post.emotion_tag || '未知'}`);
        console.log(`   📅 删除时间: ${post.updated_at ? post.updated_at.toLocaleString('zh-CN') : '未知'}`);
        console.log('   ' + '─'.repeat(80));
      });
  } catch (error) {
    console.error('❌ 查询已删除帖子失败:', error);
  }
};

// 软删除帖子
const deletePostById = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log('❌ 未找到指定的帖子');
      return;
    }
    
    if (post.deleted) {
      console.log('⚠️  该帖子已经被删除');
      return;
    }
    
    await Post.findByIdAndUpdate(postId, {
      is_deleted: true,
      updated_at: new Date()
    });
    
    console.log(`✅ 帖子已软删除: ${post.title || '无标题'}`);
  } catch (error) {
    console.error('❌ 删除帖子失败:', error);
  }
};

// 恢复已删除的帖子
const restorePostById = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log('❌ 未找到指定的帖子');
      return;
    }
    
    if (!post.deleted) {
      console.log('⚠️  该帖子未被删除，无需恢复');
      return;
    }
    
    await Post.findByIdAndUpdate(postId, {
      is_deleted: false,
      updated_at: new Date()
    });
    
    console.log(`✅ 帖子已恢复: ${post.title || '无标题'}`);
  } catch (error) {
    console.error('❌ 恢复帖子失败:', error);
  }
};

// 永久删除帖子
const permanentDeleteById = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log('❌ 未找到指定的帖子');
      return;
    }
    
    // 同时删除相关评论
    await Comment.deleteMany({ post_id: postId });
    await Post.findByIdAndDelete(postId);
    
    console.log(`✅ 帖子已永久删除: ${post.title || '无标题'}`);
    console.log('⚠️  相关评论也已被删除');
  } catch (error) {
    console.error('❌ 永久删除帖子失败:', error);
  }
};

// 查看帖子详情
const viewPostDetail = async (postId) => {
  try {
    const post = await Post.findById(postId)
      .populate('user_id', 'username nickname email');
    
    if (!post) {
      console.log('❌ 未找到指定的帖子');
      return;
    }
    
    console.log('\n📝 帖子详情');
    console.log(`🆔 ID: ${post._id}`);
    console.log(`📝 内容: ${post.content ? post.content.substring(0, 100) + '...' : '无内容'}`);
    console.log(`👤 作者: ${post.user_id?.nickname || post.user_id?.username || '匿名用户'}`);
    console.log(`📧 作者邮箱: ${post.user_id?.email || '未知'}`);
    console.log(`😊 情绪: ${post.emotion_tag || '未知'}`);
    console.log(`🏷️  标签: ${post.tags?.join(', ') || '无'}`);
    console.log(`👍 点赞数: ${post.likes || 0}`);
    console.log(`💬 评论数: ${post.comment_count || 0}`);
    console.log(`📅 创建时间: ${post.created_at ? post.created_at.toLocaleString('zh-CN') : '未知'}`);
    console.log(`🕐 更新时间: ${post.updated_at ? post.updated_at.toLocaleString('zh-CN') : '未知'}`);
    console.log(`🗑️  删除状态: ${post.deleted ? '已删除' : '正常'}`);
    if (post.deleted_at) {
      console.log(`📅 删除时间: ${post.deleted_at.toLocaleString('zh-CN')}`);
    }
    console.log(`📄 内容:\n${post.content || '无内容'}`);
    
    // 查看评论
    const comments = await Comment.find({ post_id: postId })
      .populate('user_id', 'username nickname')
      .sort({ created_at: -1 })
      .limit(5);
    
    if (comments.length > 0) {
      console.log('\n💬 最新评论 (最多显示5条):');
      comments.forEach((comment, index) => {
        console.log(`${index + 1}. ${comment.user_id?.nickname || comment.user_id?.username || '匿名用户'}: ${comment.content}`);
        console.log(`   📅 ${comment.created_at ? comment.created_at.toLocaleString('zh-CN') : '未知'}`);
      });
    }
  } catch (error) {
    console.error('❌ 查询帖子详情失败:', error);
  }
};

// 查看统计信息
const showStats = async () => {
  try {
    console.log('\n📊 火星树洞统计信息\n');
    
    // 帖子统计
    const totalPosts = await Post.countDocuments();
    const activePosts = await Post.countDocuments({ deleted: { $ne: true } });
    const deletedPosts = await Post.countDocuments({ deleted: true });
    const recentPosts = await Post.countDocuments({
      created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      deleted: { $ne: true }
    });
    
    console.log('📝 帖子统计:');
    console.log(`   总帖子数: ${totalPosts}`);
    console.log(`   活跃帖子: ${activePosts}`);
    console.log(`   已删除帖子: ${deletedPosts}`);
    console.log(`   近7天新帖: ${recentPosts}`);
    
    // 情绪分布
    const emotionStats = await Post.aggregate([
      { $match: { deleted: { $ne: true } } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n😊 情绪分布:');
    emotionStats.forEach(stat => {
      console.log(`   ${stat._id || '未知'}: ${stat.count}`);
    });
    
    // 评论统计
    const totalComments = await Comment.countDocuments();
    const recentComments = await Comment.countDocuments({
      created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    console.log('\n💬 评论统计:');
    console.log(`   总评论数: ${totalComments}`);
    console.log(`   近7天新评论: ${recentComments}`);
    
    // 热门帖子
    const popularPosts = await Post.find({ is_deleted: { $ne: true } })
      .populate('user_id', 'username nickname')
      .sort({ likes: -1 })
      .limit(5);
    
    console.log('\n🔥 热门帖子 (按点赞数):');
    popularPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.content ? post.content.substring(0, 30) + '...' : '无内容'} - ${post.likes || 0} 赞`);
      console.log(`      作者: ${post.user_id?.nickname || post.user_id?.username || '匿名用户'}`);
    });
    
  } catch (error) {
    console.error('❌ 查询统计信息失败:', error);
  }
};

// 清理数据
const cleanupData = async () => {
  try {
    console.log('🧹 开始清理数据...');
    
    // 删除孤立的评论（对应的帖子不存在）
    const orphanComments = await Comment.find({
      post_id: { $nin: await Post.find().distinct('_id') }
    });
    
    if (orphanComments.length > 0) {
      await Comment.deleteMany({
        post_id: { $nin: await Post.find().distinct('_id') }
      });
      console.log(`✅ 清理了 ${orphanComments.length} 条孤立评论`);
    }
    
    // 更新帖子的评论数
    const posts = await Post.find();
    for (const post of posts) {
      const commentCount = await Comment.countDocuments({ post_id: post._id });
      if (post.comment_count !== commentCount) {
        await Post.findByIdAndUpdate(post._id, { comment_count: commentCount });
      }
    }
    console.log('✅ 更新了帖子评论数');
    
    console.log('🎉 数据清理完成');
  } catch (error) {
    console.error('❌ 数据清理失败:', error);
  }
};

// 显示帮助信息
const showHelp = () => {
  console.log('\n🚀 火星树洞数据库管理工具');
  console.log('\n📖 使用方法:');
  console.log('   node scripts/manage-posts.js [命令] [选项]');
  console.log('\n🎯 可用命令:');
  console.log('   view                    查看所有帖子');
  console.log('   view --page 2           查看第2页帖子');
  console.log('   view --emotion happy    查看指定情绪的帖子');
  console.log('   view --tag 音乐         查看指定标签的帖子');
  console.log('   view-deleted            查看已删除的帖子');
  console.log('   detail <post_id>        查看帖子详情');
  console.log('   delete <post_id>        软删除指定帖子');
  console.log('   restore <post_id>       恢复已删除的帖子');
  console.log('   permanent-delete <id>   永久删除指定帖子');
  console.log('   stats                   查看统计信息');
  console.log('   cleanup                 清理数据');
  console.log('   help                    显示帮助信息');
  console.log('\n💡 示例:');
  console.log('   node scripts/manage-posts.js view --page 2');
  console.log('   node scripts/manage-posts.js detail 507f1f77bcf86cd799439011');
  console.log('   node scripts/manage-posts.js delete 507f1f77bcf86cd799439011');
  console.log('\n⚠️  注意事项:');
  console.log('   - 软删除的帖子可以恢复，永久删除无法恢复');
  console.log('   - 永久删除帖子时会同时删除相关评论');
  console.log('   - 建议定期运行 cleanup 命令清理数据');
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
      case 'view':
        const options = {};
        const pageIndex = args.indexOf('--page');
        const emotionIndex = args.indexOf('--emotion');
        const tagIndex = args.indexOf('--tag');
        const limitIndex = args.indexOf('--limit');
        
        if (pageIndex !== -1 && pageIndex + 1 < args.length) {
          options.page = parseInt(args[pageIndex + 1]) || 1;
        }
        if (emotionIndex !== -1 && emotionIndex + 1 < args.length) {
          options.emotion = args[emotionIndex + 1];
        }
        if (tagIndex !== -1 && tagIndex + 1 < args.length) {
          options.tag = args[tagIndex + 1];
        }
        if (limitIndex !== -1 && limitIndex + 1 < args.length) {
          options.limit = parseInt(args[limitIndex + 1]) || 10;
        }
        
        await viewAllPosts(options);
        break;
        
      case 'view-deleted':
        await viewDeletedPosts();
        break;
        
      case 'detail':
        if (args[1]) {
          await viewPostDetail(args[1]);
        } else {
          console.log('❌ 请提供帖子ID');
          console.log('用法: node scripts/manage-posts.js detail <post_id>');
        }
        break;
        
      case 'delete':
        if (args[1]) {
          await deletePostById(args[1]);
        } else {
          console.log('❌ 请提供要删除的帖子ID');
          console.log('用法: node scripts/manage-posts.js delete <post_id>');
        }
        break;
        
      case 'restore':
        if (args[1]) {
          await restorePostById(args[1]);
        } else {
          console.log('❌ 请提供要恢复的帖子ID');
          console.log('用法: node scripts/manage-posts.js restore <post_id>');
        }
        break;
        
      case 'permanent-delete':
        if (args[1]) {
          console.log('⚠️  警告: 这将永久删除帖子及其所有评论!');
          await permanentDeleteById(args[1]);
        } else {
          console.log('❌ 请提供要永久删除的帖子ID');
          console.log('用法: node scripts/manage-posts.js permanent-delete <post_id>');
        }
        break;
        
      case 'stats':
        await showStats();
        break;
        
      case 'cleanup':
        await cleanupData();
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