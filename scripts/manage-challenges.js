const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 导入模型
const ChallengeTheme = require('../server/models/ChallengeTheme');
const ChallengeSubmission = require('../server/models/ChallengeSubmission');
const User = require('../server/models/User');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

// 查看所有挑战赛
const viewChallenges = async () => {
  try {
    const challenges = await ChallengeTheme.find()
      .populate('createdBy', 'username nickname')
      .sort({ createdAt: -1 });
    
    console.log('\n🏆 挑战赛列表');
    console.log(`📊 总计: ${challenges.length} 个挑战赛\n`);
    
    for (const challenge of challenges) {
      const submissionCount = await ChallengeSubmission.countDocuments({ 
        challengeTheme: challenge._id 
      });
      
      console.log(`🎯 ${challenge.title}`);
      console.log(`   🆔 ID: ${challenge._id}`);
      console.log(`   📝 主题: ${challenge.theme}`);
      console.log(`   👤 创建者: ${challenge.createdBy?.nickname || challenge.createdBy?.username || '未知'}`);
      console.log(`   📅 时间: ${challenge.startDate?.toLocaleDateString()} - ${challenge.endDate?.toLocaleDateString()}`);
      console.log(`   📊 作品数: ${submissionCount}`);
      console.log(`   ✅ 状态: ${challenge.isActive ? '进行中' : '已结束'}`);
      console.log('   ' + '─'.repeat(80));
    }
  } catch (error) {
    console.error('❌ 查询挑战赛失败:', error);
  }
};

// 查看指定挑战赛的作品
const viewSubmissions = async (challengeId, options = {}) => {
  try {
    const { page = 1, limit = 10, showContact = false } = options;
    const skip = (page - 1) * limit;
    
    // 验证挑战赛是否存在
    const challenge = await ChallengeTheme.findById(challengeId);
    if (!challenge) {
      console.log('❌ 挑战赛不存在');
      return;
    }
    
    const submissions = await ChallengeSubmission.find({ challengeTheme: challengeId })
      .populate('user', 'username nickname email phone')
      .populate('challengeTheme', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ChallengeSubmission.countDocuments({ challengeTheme: challengeId });
    const totalPages = Math.ceil(total / limit);
    
    console.log(`\n📝 ${challenge.title} - 作品列表 (第${page}页，共${totalPages}页)`);
    console.log(`📊 总计: ${total} 个作品\n`);
    
    submissions.forEach((submission, index) => {
      console.log(`${skip + index + 1}. 🎨 ${submission.title}`);
      console.log(`   🆔 ID: ${submission._id}`);
      console.log(`   👤 作者: ${submission.user?.nickname || submission.user?.username || '匿名用户'}`);
      console.log(`   📝 描述: ${submission.description ? submission.description.substring(0, 100) + '...' : '无描述'}`);
      console.log(`   📊 状态: ${getStatusText(submission.status)}`);
      console.log(`   👍 投票数: ${submission.votes || 0}`);
      console.log(`   📅 提交时间: ${submission.createdAt?.toLocaleString('zh-CN')}`);
      
      if (showContact && submission.contactInfo) {
        console.log(`   📞 联系方式:`);
        if (submission.contactInfo.phone) {
          console.log(`      电话: ${submission.contactInfo.phone}`);
        }
        if (submission.contactInfo.email) {
          console.log(`      邮箱: ${submission.contactInfo.email}`);
        }
      }
      
      console.log('   ' + '─'.repeat(80));
    });
    
    if (totalPages > 1) {
      console.log(`\n💡 查看其他页面: node scripts/manage-challenges.js submissions ${challengeId} --page ${page + 1}`);
    }
  } catch (error) {
    console.error('❌ 查询作品失败:', error);
  }
};

// 查看作品详情
const viewSubmissionDetail = async (submissionId) => {
  try {
    const submission = await ChallengeSubmission.findById(submissionId)
      .populate('user', 'username nickname email phone')
      .populate('challengeTheme', 'title');
    
    if (!submission) {
      console.log('❌ 作品不存在');
      return;
    }
    
    console.log('\n🎨 作品详情');
    console.log(`🆔 ID: ${submission._id}`);
    console.log(`🎯 挑战赛: ${submission.challengeTheme?.title || '未知'}`);
    console.log(`📝 标题: ${submission.title}`);
    console.log(`👤 作者: ${submission.user?.nickname || submission.user?.username || '匿名用户'}`);
    console.log(`📧 作者邮箱: ${submission.user?.email || '未知'}`);
    console.log(`📱 作者电话: ${submission.user?.phone || '未知'}`);
    console.log(`📊 状态: ${getStatusText(submission.status)}`);
    console.log(`👍 投票数: ${submission.votes || 0}`);
    console.log(`📅 提交时间: ${submission.createdAt?.toLocaleString('zh-CN')}`);
    
    if (submission.contactInfo) {
      console.log(`\n📞 联系信息:`);
      if (submission.contactInfo.phone) {
        console.log(`   电话: ${submission.contactInfo.phone}`);
      }
      if (submission.contactInfo.email) {
        console.log(`   邮箱: ${submission.contactInfo.email}`);
      }
    }
    
    console.log(`\n📄 作品描述:`);
    console.log(submission.description || '无描述');
    
    if (submission.photos && submission.photos.length > 0) {
      console.log(`\n🖼️  作品图片 (${submission.photos.length}张):`);
      submission.photos.forEach((photo, index) => {
        console.log(`   ${index + 1}. ${photo.url}`);
      });
    }
  } catch (error) {
    console.error('❌ 查询作品详情失败:', error);
  }
};

// 查看挑战赛统计信息
const viewStats = async () => {
  try {
    const totalChallenges = await ChallengeTheme.countDocuments();
    const activeChallenges = await ChallengeTheme.countDocuments({ isActive: true });
    const totalSubmissions = await ChallengeSubmission.countDocuments();
    const pendingSubmissions = await ChallengeSubmission.countDocuments({ status: 'pending' });
    const approvedSubmissions = await ChallengeSubmission.countDocuments({ status: 'approved' });
    const rejectedSubmissions = await ChallengeSubmission.countDocuments({ status: 'rejected' });
    
    console.log('\n📊 挑战赛统计信息');
    console.log('\n🏆 挑战赛:');
    console.log(`   总挑战赛数: ${totalChallenges}`);
    console.log(`   进行中: ${activeChallenges}`);
    console.log(`   已结束: ${totalChallenges - activeChallenges}`);
    
    console.log('\n🎨 作品:');
    console.log(`   总作品数: ${totalSubmissions}`);
    console.log(`   待审核: ${pendingSubmissions}`);
    console.log(`   已通过: ${approvedSubmissions}`);
    console.log(`   已拒绝: ${rejectedSubmissions}`);
    
    // 最受欢迎的挑战赛
    const popularChallenges = await ChallengeSubmission.aggregate([
      { $group: { _id: '$challengeTheme', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'challengethemes', localField: '_id', foreignField: '_id', as: 'challenge' } },
      { $unwind: '$challenge' }
    ]);
    
    if (popularChallenges.length > 0) {
      console.log('\n🔥 最受欢迎的挑战赛:');
      popularChallenges.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.challenge.title} (${item.count}个作品)`);
      });
    }
  } catch (error) {
    console.error('❌ 查询统计信息失败:', error);
  }
};

// 查看挑战赛中点赞最高的作品
const viewTopLikedSubmission = async (challengeId) => {
  try {
    // 验证挑战赛是否存在
    const challenge = await ChallengeTheme.findById(challengeId);
    if (!challenge) {
      console.log('❌ 挑战赛不存在');
      return;
    }
    
    // 查找点赞最高的作品
    const topSubmission = await ChallengeSubmission.findOne({ 
      challengeTheme: challengeId 
    })
    .populate('user', 'username nickname')
    .sort({ votes: -1 })
    .limit(1);
    
    if (!topSubmission) {
      console.log(`\n🎯 ${challenge.title} 暂无作品`);
      return;
    }
    
    console.log(`\n🏆 ${challenge.title} - 最受欢迎作品`);
    console.log(`🎨 作品标题: ${topSubmission.title}`);
    console.log(`👤 作者用户名: ${topSubmission.user?.username || '未知'}`);
    console.log(`👤 作者昵称: ${topSubmission.user?.nickname || '未设置'}`);
    console.log(`👍 点赞数: ${topSubmission.votes || 0}`);
    console.log(`📅 提交时间: ${topSubmission.createdAt?.toLocaleString('zh-CN')}`);
    console.log(`📊 审核状态: ${getStatusText(topSubmission.status)}`);
    
    if (topSubmission.description) {
      console.log(`📝 作品描述: ${topSubmission.description.substring(0, 200)}${topSubmission.description.length > 200 ? '...' : ''}`);
    }
    
    // 显示前5名高点赞作品
    const top5Submissions = await ChallengeSubmission.find({ 
      challengeTheme: challengeId 
    })
    .populate('user', 'username nickname')
    .sort({ votes: -1 })
    .limit(5);
    
    console.log(`\n📈 点赞排行榜 Top 5:`);
    top5Submissions.forEach((submission, index) => {
      console.log(`${index + 1}. 👍${submission.votes || 0} | 🎨${submission.title} | 👤${submission.user?.nickname || submission.user?.username || '匿名'}`);
    });
    
  } catch (error) {
    console.error('❌ 查询最受欢迎作品失败:', error);
  }
};

// 导出作品数据
const exportSubmissions = async (challengeId, format = 'json') => {
  try {
    const fs = require('fs');
    
    let query = {};
    let filename = 'all_submissions';
    
    if (challengeId) {
      const challenge = await ChallengeTheme.findById(challengeId);
      if (!challenge) {
        console.log('❌ 挑战赛不存在');
        return;
      }
      query = { challengeTheme: challengeId };
      filename = `${challenge.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_submissions`;
    }
    
    const submissions = await ChallengeSubmission.find(query)
      .populate('user', 'username nickname email phone')
      .populate('challengeTheme', 'title')
      .sort({ createdAt: -1 });
    
    const exportData = submissions.map(submission => ({
      id: submission._id,
      challengeTitle: submission.challengeTheme?.title,
      title: submission.title,
      description: submission.description,
      author: submission.user?.nickname || submission.user?.username,
      authorEmail: submission.user?.email,
      authorPhone: submission.user?.phone,
      contactPhone: submission.contactInfo?.phone,
      contactEmail: submission.contactInfo?.email,
      status: submission.status,
      votes: submission.votes,
      photos: submission.photos?.map(p => p.url),
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    }));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportFilename = `${filename}_${timestamp}.${format}`;
    
    if (format === 'json') {
      fs.writeFileSync(exportFilename, JSON.stringify(exportData, null, 2));
    } else if (format === 'csv') {
      const csv = require('csv-stringify/sync');
      const csvData = csv.stringify(exportData, { header: true });
      fs.writeFileSync(exportFilename, csvData);
    }
    
    console.log(`✅ 数据导出成功: ${exportFilename}`);
    console.log(`📊 导出了 ${exportData.length} 条作品记录`);
  } catch (error) {
    console.error('❌ 导出数据失败:', error);
  }
};

// 更新作品状态
const updateSubmissionStatus = async (submissionId, status) => {
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      console.log('❌ 无效的状态，有效状态: pending, approved, rejected');
      return;
    }
    
    const submission = await ChallengeSubmission.findById(submissionId);
    if (!submission) {
      console.log('❌ 作品不存在');
      return;
    }
    
    await ChallengeSubmission.findByIdAndUpdate(submissionId, {
      status: status,
      reviewedAt: new Date()
    });
    
    console.log(`✅ 作品状态更新成功: ${submission.title} -> ${getStatusText(status)}`);
  } catch (error) {
    console.error('❌ 更新作品状态失败:', error);
  }
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '⏳ 待审核',
    'approved': '✅ 已通过',
    'rejected': '❌ 已拒绝'
  };
  return statusMap[status] || status;
};

// 显示帮助信息
const showHelp = () => {
  console.log('\n🏆 挑战赛作品管理工具');
  console.log('\n📖 使用方法:');
  console.log('   node scripts/manage-challenges.js [命令] [参数]');
  console.log('\n🎯 可用命令:');
  console.log('   challenges                          查看所有挑战赛');
  console.log('   submissions <challenge_id>          查看指定挑战赛的作品');
  console.log('   submissions <challenge_id> --contact 查看作品（包含联系信息）');
  console.log('   detail <submission_id>              查看作品详情');
  console.log('   stats                               查看统计信息');
  console.log('   top <challenge_id>                  查看点赞最高的作品');
  console.log('   export [challenge_id] [format]      导出作品数据 (json/csv)');
  console.log('   status <submission_id> <status>     更新作品状态');
  console.log('   help                                显示帮助信息');
  console.log('\n💡 示例:');
  console.log('   node scripts/manage-challenges.js challenges');
  console.log('   node scripts/manage-challenges.js submissions 507f1f77bcf86cd799439011');
  console.log('   node scripts/manage-challenges.js submissions 507f1f77bcf86cd799439011 --contact');
  console.log('   node scripts/manage-challenges.js detail 507f1f77bcf86cd799439012');
  console.log('   node scripts/manage-challenges.js top 507f1f77bcf86cd799439011');
  console.log('   node scripts/manage-challenges.js export 507f1f77bcf86cd799439011 csv');
  console.log('   node scripts/manage-challenges.js status 507f1f77bcf86cd799439012 approved');
  console.log('\n⚠️  注意事项:');
  console.log('   - 联系信息仅管理员可查看');
  console.log('   - 导出功能会在当前目录生成文件');
  console.log('   - 状态更新会记录审核时间');
};

// 主函数
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'challenges':
      await viewChallenges();
      break;
      
    case 'submissions':
      const challengeId = args[1];
      if (!challengeId) {
        console.log('❌ 请提供挑战赛ID');
        break;
      }
      const showContact = args.includes('--contact');
      const pageMatch = args.find(arg => arg.startsWith('--page='));
      const page = pageMatch ? parseInt(pageMatch.split('=')[1]) : 1;
      await viewSubmissions(challengeId, { page, showContact });
      break;
      
    case 'detail':
      const submissionId = args[1];
      if (!submissionId) {
        console.log('❌ 请提供作品ID');
        break;
      }
      await viewSubmissionDetail(submissionId);
      break;
      
    case 'stats':
      await viewStats();
      break;
      
    case 'top':
      const topChallengeId = args[1];
      if (!topChallengeId) {
        console.log('❌ 请提供挑战赛ID');
        break;
      }
      await viewTopLikedSubmission(topChallengeId);
      break;
      
    case 'export':
      const exportChallengeId = args[1];
      const format = args[2] || 'json';
      await exportSubmissions(exportChallengeId, format);
      break;
      
    case 'status':
      const statusSubmissionId = args[1];
      const newStatus = args[2];
      if (!statusSubmissionId || !newStatus) {
        console.log('❌ 请提供作品ID和新状态');
        break;
      }
      await updateSubmissionStatus(statusSubmissionId, newStatus);
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
  
  mongoose.connection.close();
};

// 运行脚本
main().catch(console.error);