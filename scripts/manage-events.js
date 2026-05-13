const mongoose = require('mongoose');
require('dotenv').config();

// 导入模型
const MapEvent = require('../server/models/MapEvent');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mars_music', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// 查看所有地图事件
const viewAllEvents = async () => {
  try {
    const events = await MapEvent.find({ is_deleted: false })
      .sort({ createdAt: -1 })
      .select('title description latitude longitude author status createdAt');
    
    console.log('\n=== 所有地图事件 ===');
    console.log(`总计: ${events.length} 个事件\n`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event._id}`);
      console.log(`   标题: ${event.title}`);
      console.log(`   描述: ${event.description}`);
      console.log(`   位置: [${event.latitude}, ${event.longitude}]`);
      console.log(`   作者: ${event.author}`);
      console.log(`   状态: ${event.status}`);
      console.log(`   创建时间: ${event.createdAt}`);
      console.log('---');
    });
  } catch (error) {
    console.error('查看事件失败:', error);
  }
};

// 删除指定ID的事件
const deleteEventById = async (eventId) => {
  try {
    const event = await MapEvent.findById(eventId);
    if (!event) {
      console.log('未找到指定ID的事件');
      return;
    }
    
    // 软删除
    event.is_deleted = true;
    await event.save();
    
    console.log(`事件已删除: ${event.title}`);
  } catch (error) {
    console.error('删除事件失败:', error);
  }
};

// 永久删除指定ID的事件
const permanentDeleteById = async (eventId) => {
  try {
    const result = await MapEvent.findByIdAndDelete(eventId);
    if (!result) {
      console.log('未找到指定ID的事件');
      return;
    }
    
    console.log(`事件已永久删除: ${result.title}`);
  } catch (error) {
    console.error('永久删除事件失败:', error);
  }
};

// 清空所有事件（软删除）
const deleteAllEvents = async () => {
  try {
    const result = await MapEvent.updateMany(
      { is_deleted: false },
      { is_deleted: true }
    );
    
    console.log(`已软删除 ${result.modifiedCount} 个事件`);
  } catch (error) {
    console.error('删除所有事件失败:', error);
  }
};

// 永久清空所有事件
const permanentDeleteAll = async () => {
  try {
    const result = await MapEvent.deleteMany({});
    console.log(`已永久删除 ${result.deletedCount} 个事件`);
  } catch (error) {
    console.error('永久删除所有事件失败:', error);
  }
};

// 恢复软删除的事件
const restoreEventById = async (eventId) => {
  try {
    const event = await MapEvent.findById(eventId);
    if (!event) {
      console.log('未找到指定ID的事件');
      return;
    }
    
    event.is_deleted = false;
    await event.save();
    
    console.log(`事件已恢复: ${event.title}`);
  } catch (error) {
    console.error('恢复事件失败:', error);
  }
};

// 查看已删除的事件
const viewDeletedEvents = async () => {
  try {
    const events = await MapEvent.find({ is_deleted: true })
      .sort({ createdAt: -1 })
      .select('title description latitude longitude author status createdAt');
    
    console.log('\n=== 已删除的地图事件 ===');
    console.log(`总计: ${events.length} 个已删除事件\n`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event._id}`);
      console.log(`   标题: ${event.title}`);
      console.log(`   描述: ${event.description}`);
      console.log(`   位置: [${event.latitude}, ${event.longitude}]`);
      console.log(`   作者: ${event.author}`);
      console.log(`   状态: ${event.status}`);
      console.log(`   创建时间: ${event.createdAt}`);
      console.log('---');
    });
  } catch (error) {
    console.error('查看已删除事件失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'view':
    case 'list':
      await viewAllEvents();
      break;
      
    case 'delete':
      if (args[1]) {
        await deleteEventById(args[1]);
      } else {
        console.log('请提供要删除的事件ID');
        console.log('用法: node manage-events.js delete <event_id>');
      }
      break;
      
    case 'delete-all':
      console.log('警告: 这将软删除所有事件!');
      await deleteAllEvents();
      break;
      
    case 'permanent-delete':
      if (args[1]) {
        await permanentDeleteById(args[1]);
      } else {
        console.log('请提供要永久删除的事件ID');
        console.log('用法: node manage-events.js permanent-delete <event_id>');
      }
      break;
      
    case 'permanent-delete-all':
      console.log('警告: 这将永久删除所有事件!');
      await permanentDeleteAll();
      break;
      
    case 'restore':
      if (args[1]) {
        await restoreEventById(args[1]);
      } else {
        console.log('请提供要恢复的事件ID');
        console.log('用法: node manage-events.js restore <event_id>');
      }
      break;
      
    case 'view-deleted':
      await viewDeletedEvents();
      break;
      
    default:
      console.log('地图事件管理脚本');
      console.log('\n可用命令:');
      console.log('  view, list              - 查看所有活跃事件');
      console.log('  delete <id>             - 软删除指定事件');
      console.log('  delete-all              - 软删除所有事件');
      console.log('  permanent-delete <id>   - 永久删除指定事件');
      console.log('  permanent-delete-all    - 永久删除所有事件');
      console.log('  restore <id>            - 恢复软删除的事件');
      console.log('  view-deleted            - 查看已删除的事件');
      console.log('\n示例:');
      console.log('  node scripts/manage-events.js view');
      console.log('  node scripts/manage-events.js delete 507f1f77bcf86cd799439011');
      console.log('  node scripts/manage-events.js restore 507f1f77bcf86cd799439011');
      break;
  }
  
  mongoose.connection.close();
};

// 运行脚本
main().catch(console.error);