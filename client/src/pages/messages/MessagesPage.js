import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { createApiUrl, API_ENDPOINTS } from '../../config/api';

const MessagesPage = () => {
  const { userId: selectedUserId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 获取对话列表
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('/api/messages/conversations'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      } else {
        setError(data.error || '获取对话列表失败');
      }
    } catch (error) {
      console.error('获取对话列表失败:', error);
      setError('获取对话列表失败');
    }
  };

  // 获取与特定用户的对话
  const fetchConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(`/api/messages/conversations/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
        setSelectedConversation(data.data.conversation);
      } else {
        setError(data.error || '获取对话失败');
      }
    } catch (error) {
      console.error('获取对话失败:', error);
      setError('获取对话失败');
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('/api/messages/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser.id,
          content: newMessage.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        // 刷新对话列表以更新最后消息
        fetchConversations();
      } else {
        setError(data.error || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setError('发送消息失败');
    } finally {
      setSending(false);
    }
  };

  // 处理回车发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 选择对话
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    fetchConversation(conversation.otherUser.id);
    navigate(`/messages/${conversation.otherUser.id}`);
  };

  // 格式化时间
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('zh-CN', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // 过滤对话
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchConversations().finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedUserId && conversations.length > 0) {
      const conversation = conversations.find(conv => 
        conv.otherUser.id === selectedUserId
      );
      if (conversation) {
        selectConversation(conversation);
      } else {
        // 如果没有找到对话，创建新对话
        fetchConversation(selectedUserId);
      }
    }
  }, [selectedUserId, conversations]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          正在加载私信...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          私信
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ height: '70vh', display: 'flex' }}>
        {/* 对话列表 */}
        <Box sx={{ 
          width: { xs: '100%', md: '350px' }, 
          borderRight: { md: '1px solid #e0e0e0' },
          display: { xs: selectedConversation ? 'none' : 'block', md: 'block' }
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <List sx={{ p: 0, height: 'calc(100% - 80px)', overflow: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  {conversations.length === 0 ? '暂无对话' : '没有找到匹配的对话'}
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => selectConversation(conversation)}
                  sx={{
                    borderBottom: '1px solid #f5f5f5',
                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.05)' },
                    '&.Mui-selected': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="error"
                      invisible={conversation.unreadCount === 0}
                    >
                      <Avatar
                        src={conversation.otherUser.avatar ? 
                          createApiUrl(conversation.otherUser.avatar) : undefined}
                        alt={conversation.otherUser.nickname}
                      >
                        {conversation.otherUser.username[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {conversation.otherUser.nickname || conversation.otherUser.username}
                        </Typography>
                        {conversation.unreadCount > 0 && (
                          <Chip
                            size="small"
                            label={conversation.unreadCount}
                            color="error"
                            sx={{ height: 16, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {conversation.lastMessage?.content || '暂无消息'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.lastMessageTime && formatTime(conversation.lastMessageTime)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>

        {/* 消息界面 */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          display: { xs: selectedConversation ? 'flex' : 'none', md: 'flex' }
        }}>
          {selectedConversation ? (
            <>
              {/* 对话头部 */}
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <IconButton
                  sx={{ display: { xs: 'block', md: 'none' } }}
                  onClick={() => {
                    setSelectedConversation(null);
                    navigate('/messages');
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar
                  src={selectedConversation.otherUser.avatar ? 
                    createApiUrl(selectedConversation.otherUser.avatar) : undefined}
                  alt={selectedConversation.otherUser.nickname}
                >
                  {selectedConversation.otherUser.username[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedConversation.otherUser.nickname || selectedConversation.otherUser.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedConversation.otherUser.username}
                  </Typography>
                </Box>
              </Box>

              {/* 消息列表 */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      开始你们的对话吧！
                    </Typography>
                  </Box>
                ) : (
                  messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender._id === user.id ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.sender._id === user.id ? '#667eea' : '#f5f5f5',
                          color: message.sender._id === user.id ? 'white' : 'text.primary',
                          borderRadius: 2,
                          borderTopRightRadius: message.sender._id === user.id ? 0 : 2,
                          borderTopLeftRadius: message.sender._id === user.id ? 2 : 0
                        }}
                      >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.8,
                            fontSize: '0.7rem'
                          }}
                        >
                          {formatTime(message.createdAt)}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
              </Box>

              {/* 消息输入框 */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="输入消息..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sending}
                          color="primary"
                        >
                          {sending ? <CircularProgress size={20} /> : <SendIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <MessageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                选择一个对话开始聊天
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default MessagesPage;