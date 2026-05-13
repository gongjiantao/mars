const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../server/models/User');
require('dotenv').config();

// 连接数据库
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 创建管理员账户
const createAdmin = async (username, email, password) => {
  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`✅ 管理员账户已存在: ${existingUser.username}`);
        console.log(`📧 邮箱: ${existingUser.email}`);
        console.log(`🎭 角色: ${existingUser.role}`);
        return existingUser;
      } else {
        // 如果用户存在但不是管理员，升级为管理员
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ 用户 ${existingUser.username} 已升级为管理员`);
        return existingUser;
      }
    }

    // 创建新的管理员账户
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new User({
      username,
      email,
      password: hashedPassword,
      nickname: username,
      role: 'admin',
      is_verified: true,
      status: 'active',
      bio: '系统管理员',
      avatar: '/uploads/avatars/admin.png'
    });

    await admin.save();
    console.log('✅ 管理员账户创建成功!');
    console.log(`👤 用户名: ${admin.username}`);
    console.log(`📧 邮箱: ${admin.email}`);
    console.log(`🎭 角色: ${admin.role}`);
    console.log(`🆔 ID: ${admin._id}`);
    
    return admin;
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error);
    throw error;
  }
};

// 列出所有管理员
const listAdmins = async () => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    console.log('\n👑 管理员列表:');
    console.log(`📊 总计: ${admins.length} 个管理员\n`);
    
    if (admins.length === 0) {
      console.log('❌ 暂无管理员账户');
      return;
    }
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.username} (${admin.nickname})`);
      console.log(`   📧 ${admin.email}`);
      console.log(`   🎭 角色: ${admin.role}`);
      console.log(`   📅 注册: ${admin.created_at ? admin.created_at.toLocaleString('zh-CN') : '未知'}`);
      console.log(`   🆔 ID: ${admin._id}`);
      console.log('   ' + '─'.repeat(50));
    });
  } catch (error) {
    console.error('❌ 查询管理员失败:', error);
  }
};

// 删除管理员权限
const removeAdmin = async (username) => {
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ 未找到用户名为 "${username}" 的用户`);
      return;
    }
    
    if (user.role !== 'admin') {
      console.log(`❌ 用户 "${username}" 不是管理员`);
      return;
    }
    
    user.role = 'user';
    await user.save();
    
    console.log(`✅ 已移除用户 "${username}" 的管理员权限`);
  } catch (error) {
    console.error('❌ 移除管理员权限失败:', error);
  }
};

// 显示帮助信息
const showHelp = () => {
  console.log('\n🚀 火星社区管理员管理工具');
  console.log('\n📖 使用方法:');
  console.log('   node scripts/create-admin.js [命令] [参数]');
  console.log('\n🎯 可用命令:');
  console.log('   create <用户名> <邮箱> <密码>    创建管理员账户');
  console.log('   list                           列出所有管理员');
  console.log('   remove <用户名>                 移除管理员权限');
  console.log('   help                           显示帮助信息');
  console.log('\n💡 示例:');
  console.log('   node scripts/create-admin.js create admin admin@mars.com 123456');
  console.log('   node scripts/create-admin.js list');
  console.log('   node scripts/create-admin.js remove admin');
  console.log('\n⚠️  注意事项:');
  console.log('   - 管理员密码建议使用强密码');
  console.log('   - 管理员账户具有删除帖子、管理挑战赛等权限');
  console.log('   - 请妥善保管管理员账户信息');
};

// 主函数
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('help')) {
    showHelp();
    return;
  }
  
  await connectDB();
  
  try {
    const command = args[0];
    
    switch (command) {
      case 'create':
        if (args.length < 4) {
          console.log('❌ 参数不足，请提供用户名、邮箱和密码');
          console.log('💡 使用方法: node scripts/create-admin.js create <用户名> <邮箱> <密码>');
          break;
        }
        await createAdmin(args[1], args[2], args[3]);
        break;
        
      case 'list':
        await listAdmins();
        break;
        
      case 'remove':
        if (args.length < 2) {
          console.log('❌ 请提供要移除管理员权限的用户名');
          console.log('💡 使用方法: node scripts/create-admin.js remove <用户名>');
          break;
        }
        await removeAdmin(args[1]);
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