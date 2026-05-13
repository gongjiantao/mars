const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FanMessage = require('../server/models/FanMessage');

// 加载环境变量
dotenv.config();

// 初始粉丝留言数据
const initialFanMessages = [
  {
    message_id: 1,
    name: '小煤球001',
    message: '花花的音乐就是我的精神支柱，每一首歌都能治愈我的心灵',
    avatar: 'img/2630_bhewe.jpg',
    likes: 0,
    sort_order: 1
  },
  {
    message_id: 2,
    name: '火星居民',
    message: '华晨宇的演唱会真的太震撼了，舞美设计简直是艺术品',
    avatar: 'img/20210501154254_02eee.jpg',
    likes: 0,
    sort_order: 2
  },
  {
    message_id: 3,
    name: '黑煤球团长',
    message: '从快男到现在，一直支持花花，他的音乐越来越有深度',
    avatar: 'img/20210225004139_70fbc.jpg',
    likes: 0,
    sort_order: 3
  },
  {
    message_id: 4,
    name: '宇宙粉',
    message: '烟台日出演唱会太美了，那个日出的舞美设计让我哭了',
    avatar: 'img/f6b_w1689_h2480.jpg',
    likes: 0,
    sort_order: 4
  },
  {
    message_id: 5,
    name: '音乐追梦人',
    message: '华晨宇不仅是歌手，更是艺术家，他的每场演出都是视觉盛宴',
    avatar: 'img/C.jpg',
    likes: 0,
    sort_order: 5
  },
  {
    message_id: 6,
    name: '煤球守护者',
    message: '花花的声音有魔力，能够穿透心灵，带我们进入他的音乐宇宙',
    avatar: 'img/3BSWWOANSz0Q3Ed.jpg',
    likes: 0,
    sort_order: 6
  }
];

async function initFanMessages() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 数据库连接成功');

    // 检查是否已存在数据
    const existingCount = await FanMessage.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  数据库中已存在 ${existingCount} 条粉丝留言数据`);
      console.log('如需重新初始化，请先清空数据库或删除现有数据');
      
      // 询问是否要重置所有点赞数为0
      console.log('\n正在重置所有留言的点赞数为0...');
      const resetResult = await FanMessage.updateMany(
        {},
        { $set: { likes: 0 } }
      );
      console.log(`✅ 已重置 ${resetResult.modifiedCount} 条留言的点赞数为0`);
      
      await mongoose.disconnect();
      return;
    }

    // 插入初始数据
    console.log('正在插入粉丝留言初始数据...');
    const insertedMessages = await FanMessage.insertMany(initialFanMessages);
    console.log(`✅ 成功插入 ${insertedMessages.length} 条粉丝留言数据`);

    // 显示插入的数据
    console.log('\n📝 插入的数据:');
    insertedMessages.forEach((message, index) => {
      console.log(`${index + 1}. ${message.name}: ${message.message.substring(0, 30)}... (点赞数: ${message.likes})`);
    });

    console.log('\n🎉 粉丝留言数据初始化完成！');
    console.log('💡 提示: 所有留言的初始点赞数都设置为0，符合用户要求');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已断开');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initFanMessages();
}

module.exports = initFanMessages;