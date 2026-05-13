const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FanMessage = require('../server/models/FanMessage');

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

// 查看所有粉丝留言
const viewMessages = async (options = {}) => {
  try {
    const { page = 1, limit = 10, showHidden = false } = options;
    const skip = (page - 1) * limit;
    
    const filter = showHidden ? {} : { is_active: true };
    
    const messages = await FanMessage.find(filter)
      .sort({ sort_order: 1, created_at: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await FanMessage.countDocuments(filter);
    
    console.log(`\n📝 粉丝留言列表 (第${page}页，共${Math.ceil(total/limit)}页)\n`);
    
    if (messages.length === 0) {
      console.log('暂无留言数据');
      return;
    }
    
    messages.forEach((message, index) => {
      const status = message.is_active ? '✅' : '❌';
      console.log(`${skip + index + 1}. [ID: ${message.message_id}] ${status} ${message.name}`);
      console.log(`   内容: ${message.message}`);
      console.log(`   头像: ${message.avatar}`);
      console.log(`   点赞: ${message.likes} | 排序: ${message.sort_order}`);
      console.log(`   创建: ${message.created_at.toLocaleString('zh-CN')}`);
      console.log(`   更新: ${message.updated_at.toLocaleString('zh-CN')}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    console.log(`\n总计: ${total} 条留言`);
  } catch (error) {
    console.error('❌ 查看留言失败:', error);
  }
};

// 添加新留言
const addMessage = async (messageData) => {
  try {
    // 获取下一个message_id
    const lastMessage = await FanMessage.findOne().sort({ message_id: -1 });
    const nextId = lastMessage ? lastMessage.message_id + 1 : 1;
    
    const newMessage = new FanMessage({
      message_id: nextId,
      name: messageData.name,
      message: messageData.message,
      avatar: messageData.avatar,
      likes: messageData.likes || 0,
      sort_order: messageData.sort_order || nextId,
      is_active: messageData.is_active !== false
    });
    
    await newMessage.save();
    console.log(`✅ 成功添加留言 [ID: ${newMessage.message_id}] ${newMessage.name}`);
    console.log(`   内容: ${newMessage.message}`);
  } catch (error) {
    console.error('❌ 添加留言失败:', error);
  }
};

// 修改留言
const updateMessage = async (messageId, updateData) => {
  try {
    const message = await FanMessage.findOne({ message_id: parseInt(messageId) });
    if (!message) {
      console.log(`❌ 未找到ID为 ${messageId} 的留言`);
      return;
    }
    
    // 更新字段
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        message[key] = updateData[key];
      }
    });
    
    await message.save();
    console.log(`✅ 成功更新留言 [ID: ${messageId}]`);
    console.log(`   姓名: ${message.name}`);
    console.log(`   内容: ${message.message}`);
    console.log(`   点赞: ${message.likes}`);
    console.log(`   状态: ${message.is_active ? '显示' : '隐藏'}`);
  } catch (error) {
    console.error('❌ 更新留言失败:', error);
  }
};

// 删除留言（软删除）
const hideMessage = async (messageId) => {
  try {
    const message = await FanMessage.findOne({ message_id: parseInt(messageId) });
    if (!message) {
      console.log(`❌ 未找到ID为 ${messageId} 的留言`);
      return;
    }
    
    message.is_active = false;
    await message.save();
    console.log(`✅ 成功隐藏留言 [ID: ${messageId}] ${message.name}`);
  } catch (error) {
    console.error('❌ 隐藏留言失败:', error);
  }
};

// 恢复留言
const showMessage = async (messageId) => {
  try {
    const message = await FanMessage.findOne({ message_id: parseInt(messageId) });
    if (!message) {
      console.log(`❌ 未找到ID为 ${messageId} 的留言`);
      return;
    }
    
    message.is_active = true;
    await message.save();
    console.log(`✅ 成功显示留言 [ID: ${messageId}] ${message.name}`);
  } catch (error) {
    console.error('❌ 显示留言失败:', error);
  }
};

// 永久删除留言
const deleteMessage = async (messageId) => {
  try {
    const message = await FanMessage.findOneAndDelete({ message_id: parseInt(messageId) });
    if (!message) {
      console.log(`❌ 未找到ID为 ${messageId} 的留言`);
      return;
    }
    
    console.log(`✅ 成功删除留言 [ID: ${messageId}] ${message.name}`);
    console.log(`⚠️  此操作不可恢复！`);
  } catch (error) {
    console.error('❌ 删除留言失败:', error);
  }
};

// 重置点赞数
const resetLikes = async (messageId = null) => {
  try {
    if (messageId) {
      // 重置单条留言
      const message = await FanMessage.findOne({ message_id: parseInt(messageId) });
      if (!message) {
        console.log(`❌ 未找到ID为 ${messageId} 的留言`);
        return;
      }
      
      message.likes = 0;
      await message.save();
      console.log(`✅ 成功重置留言 [ID: ${messageId}] 的点赞数`);
    } else {
      // 重置所有留言
      const result = await FanMessage.updateMany({}, { $set: { likes: 0 } });
      console.log(`✅ 成功重置所有留言的点赞数，共影响 ${result.modifiedCount} 条记录`);
    }
  } catch (error) {
    console.error('❌ 重置点赞数失败:', error);
  }
};

// 统计信息
const showStats = async () => {
  try {
    const total = await FanMessage.countDocuments();
    const active = await FanMessage.countDocuments({ is_active: true });
    const hidden = await FanMessage.countDocuments({ is_active: false });
    
    const totalLikes = await FanMessage.aggregate([
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    
    const mostLiked = await FanMessage.findOne().sort({ likes: -1 });
    
    console.log('\n📊 粉丝留言统计信息\n');
    console.log(`总留言数: ${total}`);
    console.log(`显示中: ${active}`);
    console.log(`已隐藏: ${hidden}`);
    console.log(`总点赞数: ${totalLikes[0]?.total || 0}`);
    
    if (mostLiked) {
      console.log(`\n🔥 最受欢迎留言:`);
      console.log(`   [ID: ${mostLiked.message_id}] ${mostLiked.name}`);
      console.log(`   ${mostLiked.message}`);
      console.log(`   点赞数: ${mostLiked.likes}`);
    }
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error);
  }
};

// 重新排序
const reorderMessages = async () => {
  try {
    const messages = await FanMessage.find().sort({ message_id: 1 });
    
    for (let i = 0; i < messages.length; i++) {
      messages[i].sort_order = i + 1;
      await messages[i].save();
    }
    
    console.log(`✅ 成功重新排序 ${messages.length} 条留言`);
  } catch (error) {
    console.error('❌ 重新排序失败:', error);
  }
};

// 显示帮助信息
const showHelp = () => {
  console.log(`
🌟 粉丝留言管理工具
`);
  console.log('使用方法:');
  console.log('  node scripts/manage-fan-messages.js <命令> [参数]\n');
  
  console.log('可用命令:');
  console.log('  view [--page=1] [--limit=10] [--all]  查看留言列表');
  console.log('  add <name> <message> <avatar>            添加新留言');
  console.log('  update <id> [--name=] [--message=] [--avatar=] [--likes=] [--sort=]  更新留言');
  console.log('  hide <id>                               隐藏留言');
  console.log('  show <id>                               显示留言');
  console.log('  delete <id>                             永久删除留言');
  console.log('  reset-likes [id]                        重置点赞数（不指定id则重置所有）');
  console.log('  stats                                   显示统计信息');
  console.log('  reorder                                 重新排序');
  console.log('  help                                    显示帮助信息\n');
  
  console.log('示例:');
  console.log('  node scripts/manage-fan-messages.js view --page=2 --limit=5');
  console.log('  node scripts/manage-fan-messages.js add "小煤球" "花花最棒！" "img/avatar.jpg"');
  console.log('  node scripts/manage-fan-messages.js update 1 --name="新昵称" --likes=100');
  console.log('  node scripts/manage-fan-messages.js hide 1');
  console.log('  node scripts/manage-fan-messages.js reset-likes 1');
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
        const viewOptions = {};
        args.forEach(arg => {
          if (arg.startsWith('--page=')) viewOptions.page = parseInt(arg.split('=')[1]);
          if (arg.startsWith('--limit=')) viewOptions.limit = parseInt(arg.split('=')[1]);
          if (arg === '--all') viewOptions.showHidden = true;
        });
        await viewMessages(viewOptions);
        break;
        
      case 'add':
        if (args.length < 4) {
          console.log('❌ 参数不足。用法: add <name> <message> <avatar>');
          break;
        }
        await addMessage({
          name: args[1],
          message: args[2],
          avatar: args[3]
        });
        break;
        
      case 'update':
        if (args.length < 2) {
          console.log('❌ 参数不足。用法: update <id> [--name=] [--message=] [--avatar=] [--likes=] [--sort=]');
          break;
        }
        const updateData = {};
        args.slice(2).forEach(arg => {
          if (arg.startsWith('--name=')) updateData.name = arg.split('=')[1];
          if (arg.startsWith('--message=')) updateData.message = arg.split('=')[1];
          if (arg.startsWith('--avatar=')) updateData.avatar = arg.split('=')[1];
          if (arg.startsWith('--likes=')) updateData.likes = parseInt(arg.split('=')[1]);
          if (arg.startsWith('--sort=')) updateData.sort_order = parseInt(arg.split('=')[1]);
        });
        await updateMessage(args[1], updateData);
        break;
        
      case 'hide':
        if (args.length < 2) {
          console.log('❌ 参数不足。用法: hide <id>');
          break;
        }
        await hideMessage(args[1]);
        break;
        
      case 'show':
        if (args.length < 2) {
          console.log('❌ 参数不足。用法: show <id>');
          break;
        }
        await showMessage(args[1]);
        break;
        
      case 'delete':
        if (args.length < 2) {
          console.log('❌ 参数不足。用法: delete <id>');
          break;
        }
        await deleteMessage(args[1]);
        break;
        
      case 'reset-likes':
        await resetLikes(args[1]);
        break;
        
      case 'stats':
        await showStats();
        break;
        
      case 'reorder':
        await reorderMessages();
        break;
        
      default:
        console.log(`❌ 未知命令: ${command}`);
        showHelp();
    }
  } catch (error) {
    console.error('❌ 执行命令时发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已断开');
  }
};

// 运行主函数
main().catch(error => {
  console.error('❌ 程序执行失败:', error);
  process.exit(1);
});