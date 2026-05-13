const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');

// 敏感词检测工具
const { checkSensitiveWords } = require('../utils/sensitiveWords');

// 聊天室数据结构
const chatRooms = new Map();

// 聊天记录缓存（24小时过期）
const chatHistory = new Map();

module.exports = (io) => {
  // 如果配置了Redis，使用Redis适配器
  if (process.env.REDIS_HOST) {
    const pubClient = createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
    });
  }

  // 聊天命名空间
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log('用户连接到聊天服务:', socket.id);

    // 加入聊天室
    socket.on('join_room', ({ roomId, username, isAnonymous }) => {
      // 如果聊天室不存在，创建新聊天室
      if (!chatRooms.has(roomId)) {
        chatRooms.set(roomId, {
          id: roomId,
          users: [],
          createdAt: new Date(),
          // 24小时后自动过期
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        chatHistory.set(roomId, []);
      }

      // 将用户添加到聊天室
      const room = chatRooms.get(roomId);
      const userId = isAnonymous ? uuidv4() : username;
      const displayName = isAnonymous ? `匿名用户_${userId.substring(0, 5)}` : username;

      room.users.push({
        id: socket.id,
        userId,
        displayName,
        isAnonymous,
        joinedAt: new Date()
      });

      // 加入Socket.io房间
      socket.join(roomId);

      // 发送欢迎消息和历史记录
      socket.emit('welcome', {
        message: `欢迎加入聊天室`,
        users: room.users.map(u => ({
          displayName: u.displayName,
          isAnonymous: u.isAnonymous
        })),
        history: chatHistory.get(roomId)
      });

      // 通知其他用户有新用户加入
      socket.to(roomId).emit('user_joined', {
        displayName,
        isAnonymous,
        timestamp: new Date()
      });
    });

    // 发送消息
    socket.on('send_message', ({ roomId, message, isAnonymous }) => {
      const room = chatRooms.get(roomId);
      if (!room) return;

      const user = room.users.find(u => u.id === socket.id);
      if (!user) return;

      // 检查敏感词
      const { hasSensitiveWords, sanitizedMessage, detectedWords } = checkSensitiveWords(message);

      // 创建消息对象
      const messageObj = {
        id: uuidv4(),
        sender: user.displayName,
        isAnonymous: isAnonymous || user.isAnonymous,
        content: sanitizedMessage,
        timestamp: new Date()
      };

      // 保存到聊天历史
      const history = chatHistory.get(roomId);
      history.push(messageObj);

      // 如果历史记录过长，删除旧消息
      if (history.length > 100) {
        history.shift();
      }

      // 广播消息给聊天室所有用户
      chatNamespace.to(roomId).emit('new_message', messageObj);

      // 如果检测到敏感词，发送心理健康提示
      if (hasSensitiveWords) {
        socket.emit('mental_health_alert', {
          message: '我们注意到您的消息中包含一些可能表示情绪低落的词语。如果您需要帮助，可以拨打心理健康热线：400-161-9995',
          recommendedSongs: [
            { title: '阳光总在风雨后', artist: '许美静', url: '/audio/sunshine.mp3' },
            { title: '勇气', artist: '梁静茹', url: '/audio/courage.mp3' },
            { title: '我相信', artist: '张靓颖', url: '/audio/believe.mp3' }
          ],
          detectedWords
        });
      }
    });

    // 创建私聊邀请
    socket.on('create_private_chat', ({ postId, invitedUserId }) => {
      const roomId = uuidv4();
      socket.emit('private_chat_created', { roomId, postId });
      
      // 如果被邀请用户在线，发送邀请
      chatNamespace.sockets.forEach(clientSocket => {
        const user = Array.from(chatRooms.values())
          .flatMap(room => room.users)
          .find(u => u.userId === invitedUserId && u.id === clientSocket.id);
          
        if (user) {
          clientSocket.emit('private_chat_invitation', {
            roomId,
            inviterId: socket.id,
            inviterName: socket.user?.displayName || '发帖人'
          });
        }
      });
    });

    // 创建群聊
    socket.on('create_group_chat', ({ postId }) => {
      const roomId = uuidv4();
      socket.emit('group_chat_created', { roomId, postId });
    });

    // 离开聊天室
    socket.on('leave_room', ({ roomId }) => {
      leaveRoom(socket, roomId);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log('用户断开连接:', socket.id);
      
      // 从所有聊天室中移除用户
      for (const [roomId, room] of chatRooms.entries()) {
        if (room.users.some(u => u.id === socket.id)) {
          leaveRoom(socket, roomId);
        }
      }
    });
  });

  // 辅助函数：离开聊天室
  function leaveRoom(socket, roomId) {
    const room = chatRooms.get(roomId);
    if (!room) return;

    const userIndex = room.users.findIndex(u => u.id === socket.id);
    if (userIndex === -1) return;

    const user = room.users[userIndex];
    room.users.splice(userIndex, 1);

    // 如果聊天室没有用户了，设置过期时间
    if (room.users.length === 0) {
      setTimeout(() => {
        if (chatRooms.has(roomId) && chatRooms.get(roomId).users.length === 0) {
          chatRooms.delete(roomId);
          chatHistory.delete(roomId);
        }
      }, 3600000); // 1小时后删除空聊天室
    }

    // 离开Socket.io房间
    socket.leave(roomId);

    // 通知其他用户
    socket.to(roomId).emit('user_left', {
      displayName: user.displayName,
      timestamp: new Date()
    });
  }

  // 定期清理过期的聊天室（每小时检查一次）
  setInterval(() => {
    const now = new Date();
    for (const [roomId, room] of chatRooms.entries()) {
      if (now > room.expiresAt) {
        chatRooms.delete(roomId);
        chatHistory.delete(roomId);
      }
    }
  }, 3600000);
};